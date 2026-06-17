import { useState } from "react";
import QuizPDFReader from "../QuizPDFReader/QuizPDFReader";
import { useAppSelector } from "../../store/hooks";
import type { QA, QuizAnswerDetails } from "../../types/QuizGeneratorTypes";
import "./quiz-generator.css";
import { toast } from "react-toastify";
import type { HomeProps } from "../../types/HomeProps";
import { Button } from "../Button/Button";

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

  const user = useAppSelector((user) => user.user.user);

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
    } else {
      toast.error("Wystąpił problem podczas zapisu quizu, spróbuj ponownie");
    }
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
    <div>
      <QuizPDFReader
        user={user}
        setLoading={setLoading}
        setQuestions={setQuestions}
        setSelectedAnswers={setSelectedAnswers}
        setResults={setResults}
        setOptionsMap={setOptionsMap}
      />

      <ol className="quiz-list">
        {questions.map((question, questionIndex) => {
          const questionOptions = optionsMap[questionIndex] || [];
          const selectedAnswer = selectedAnswers[questionIndex];
          const isCorrect = results[questionIndex];

          return (
            <li key={questionIndex} className="quiz-item">
              <p className="quiz-question">{question.question}</p>

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
      {Object.keys(results).length === questions.length && questions.length ? (
        <div>
          <h3>Wyniki końcowe</h3>
          <p>
            Poprawne odpowiedzi: {correct} / {total} ({percentage}%)
          </p>
          <p>
            {percentage >= 80
              ? "Ekspert!"
              : percentage >= 50
                ? "Nieźle!"
                : "Do poprawy"}
          </p>
          <Button variant="primary" onClick={handleSaveQuiz}>
            Zakończ quiz
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default QuizGenerator;
