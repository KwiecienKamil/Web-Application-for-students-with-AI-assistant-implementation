import { useState } from "react";
import QuizPDFReader from "../QuizPDFReader/QuizPDFReader";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { QA, QuizAnswerDetails } from "../../types/QuizGeneratorTypes";
import {
  fetchQuizResults,
  type QuizResult,
} from "../../features/quizes/QuizResultsSlice";
import "./quiz-generator.css";
import { toast } from "react-toastify";
import type { HomeProps } from "../../types/HomeProps";
import { Button } from "../Button/Button";
import { parseQuizDate } from "../../utils/Helpers";

const getQuizResultDateValue = (result: QuizResult) => {
  const record = result as QuizResult & {
    created_at?: string;
    createdAt?: string;
  };

  return record.date ?? record.created_at ?? record.createdAt ?? null;
};

const formatQuizDate = (result: QuizResult) => {
  const parsed = parseQuizDate(getQuizResultDateValue(result));

  if (!parsed) return "Data niedostępna";

  return parsed.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getQuizResultTimestamp = (result: QuizResult) =>
  parseQuizDate(getQuizResultDateValue(result))?.getTime() ?? 0;

const QuizGenerator = ({ session }: HomeProps) => {
  const [questions, setQuestions] = useState<QA[]>([]);
  const [optionsMap, setOptionsMap] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [quizDetails, setQuizDetails] = useState<QuizAnswerDetails[] | null>(
    null,
  );
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const total = Object.keys(results).length;
  const correct = Object.values(results).filter(Boolean).length;
  const percentage = Math.round((correct / total) * 100);

  const dispatch = useAppDispatch();
  const user = useAppSelector((user) => user.user.user);
  const quizResults = useAppSelector((state) => state.quizes.results);
  const resultsLoading = useAppSelector((state) => state.quizes.loading);

  const sortedQuizResults = [...quizResults].sort(
    (a, b) => getQuizResultTimestamp(b) - getQuizResultTimestamp(a),
  );
  const handleAnswer = (qIndex: number, answer: string) => {
    if (selectedAnswers[qIndex] !== undefined) return;

    const isCorrect = questions[qIndex].answer === answer;

    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: answer }));
    setResults((prev) => ({ ...prev, [qIndex]: isCorrect }));
  };

  async function saveQuizResult() {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/quiz-result`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          score: correct,
          total,
          percentage,
          answers: questions.map((q, i) => ({
            question: q.question,
            correct: q.answer,
            user: selectedAnswers[i],
            isCorrect: results[i],
          })),
        }),
      },
    );

    return response.json();
  }

  const handleSaveQuiz = async () => {
    const response = await saveQuizResult();
    if (response.success) {
      setQuestions([]);
      setSelectedAnswers({});
      setResults({});
      setOptionsMap({});
      setLoading(false);
      toast.success("Quiz zapisany, możesz zacząć nowy!");

      if (session?.access_token) {
        dispatch(fetchQuizResults(session.access_token));
      }

      if (response.quizResultId) {
        fetchQuizDetails(response.quizResultId);
      }
    } else {
      toast.error("Wystąpił problem podczas zapisu quizu, spróbuj ponownie");
    }
  };

  const handleQuizResultClick = (quizResultId: number) => {
    if (activeQuizId === quizResultId) {
      setActiveQuizId(null);
      setQuizDetails(null);
      return;
    }

    fetchQuizDetails(quizResultId);
  };

  const fetchQuizDetails = async (quizResultId: number) => {
    try {
      setDetailsLoading(true);
      setActiveQuizId(quizResultId);

      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/quiz-result-details/${quizResultId}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Błąd pobierania szczegółów quizu");
      }

      const data = await res.json();
      setQuizDetails(data);
    } catch (err) {
      console.error(err);
      toast.error("Nie udało się pobrać szczegółów quizu");
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="flex-column quiz-container">
      <QuizPDFReader
        user={user}
        setLoading={setLoading}
        setQuestions={setQuestions}
        setSelectedAnswers={setSelectedAnswers}
        setResults={setResults}
        setOptionsMap={setOptionsMap}
      />
      {loading ? <p className="quiz-loading">Generowanie quizu...</p> : null}
      {questions.length > 0 ? (
        <ol className="quiz-list">
          {questions.map((question, questionIndex) => {
            const questionOptions = optionsMap[questionIndex] || [];
            const selectedAnswer = selectedAnswers[questionIndex];
            const isCorrect = results[questionIndex];

            return (
              <li key={questionIndex} className="quiz-item">
                <p className="quiz-question">
                  {questionIndex + 1}. {question.question}
                </p>

                <ul className="quiz-options">
                  {questionOptions.map((option) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectAnswer = question.answer === option;

                    let optionClass = "quiz-option";

                    if (selectedAnswer !== undefined) {
                      if (isCorrectAnswer) {
                        optionClass += " correct";
                      }

                      if (isSelected && !isCorrectAnswer) {
                        optionClass += " incorrect";
                      }
                    }

                    return (
                      <li
                        key={`${questionIndex}-${option}`}
                        className={optionClass}
                        onClick={(event) => {
                          event.preventDefault();
                          handleAnswer(questionIndex, option);
                        }}
                      >
                        {option}
                      </li>
                    );
                  })}
                </ul>

                {selectedAnswer !== undefined && (
                  <p
                    className={`quiz-result ${isCorrect ? "success" : "failure"}`}
                  >
                    {isCorrect ? "Dobrze!" : "Źle!"}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      ) : null}
      {Object.keys(results).length === questions.length && questions.length ? (
        <div className="quiz-summary">
          <h3 className="quiz-summary-title">Wyniki końcowe</h3>
          <p className="quiz-summary-score">
            Poprawne odpowiedzi: {correct} / {total} ({percentage}%)
          </p>
          <p className="quiz-summary-message">
            {percentage >= 80
              ? "Ekspert!"
              : percentage >= 50
                ? "Nieźle!"
                : "Do poprawy"}
          </p>
          <Button variant="primary" size="lg" onClick={handleSaveQuiz}>
            Zakończ quiz
          </Button>
        </div>
      ) : null}

      <section className="quiz-history">
        <h3 className="quiz-summary-title">Historia wyników</h3>
        {resultsLoading ? (
          <p className="quiz-loading">Ładowanie wyników...</p>
        ) : sortedQuizResults.length === 0 ? (
          <p className="quiz-history-empty">Brak zapisanych wyników quizu.</p>
        ) : (
          <ul className="quiz-history-list">
            {sortedQuizResults.map((result: QuizResult) => (
              <li key={result.id}>
                <button
                  type="button"
                  className={`quiz-history-item${activeQuizId === result.id ? " active" : ""}`}
                  onClick={() => handleQuizResultClick(result.id)}
                >
                  <span className="quiz-history-date">
                    {formatQuizDate(result)}
                  </span>
                  <span className="quiz-history-score">
                    {result.score} / {result.total_questions} (
                    {result.percentage}
                    %)
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {detailsLoading ? (
        <p className="quiz-loading">Ładowanie szczegółów...</p>
      ) : null}

      {quizDetails && activeQuizId && !detailsLoading ? (
        <section className="quiz-details">
          <h3 className="quiz-summary-title">Szczegóły quizu</h3>
          <ol className="quiz-list">
            {quizDetails.map((detail: QuizAnswerDetails, index) => {
              const isCorrect = !!detail.is_correct;

              return (
                <li key={index} className="quiz-item">
                  <p className="quiz-question">
                    {index + 1}. {detail.question}
                  </p>
                  <p
                    className={`quiz-detail-answer ${isCorrect ? "success" : "failure"}`}
                  >
                    Twoja odpowiedź: {detail.user_answer}
                  </p>
                  {!isCorrect ? (
                    <p className="quiz-detail-answer success">
                      Poprawna odpowiedź: {detail.correct_answer}
                    </p>
                  ) : null}
                  <p
                    className={`quiz-result ${isCorrect ? "success" : "failure"}`}
                  >
                    {isCorrect ? "Dobrze!" : "Źle!"}
                  </p>
                </li>
              );
            })}
          </ol>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setActiveQuizId(null);
              setQuizDetails(null);
            }}
          >
            Zamknij
          </Button>
        </section>
      ) : null}
    </div>
  );
};

export default QuizGenerator;
