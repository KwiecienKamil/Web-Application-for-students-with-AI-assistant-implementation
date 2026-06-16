import { useState } from "react";
import QuizPDFReader from "../QuizPDFReader/QuizPDFReader";
import { useAppSelector } from "../../store/hooks";
import type { QA, QuizAnswerDetails } from "../../types/QuizGeneratorTypes";
import "./quiz-generator.css";

const QuizGenerator = () => {
  const [questions, setQuestions] = useState<QA[]>([]);
  const [optionsMap, setOptionsMap] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [quizDetails, setQuizDetails] = useState<QuizAnswerDetails[] | null>(
    null,
  );
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [results, setResults] = useState<Record<number, boolean>>({});

  const handleAnswer = (qIndex: number, answer: string) => {
    if (selectedAnswers[qIndex] !== undefined) return;

    const isCorrect = questions[qIndex].answer === answer;

    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: answer }));
    setResults((prev) => ({ ...prev, [qIndex]: isCorrect }));
  };

  const user = useAppSelector((user) => user.user.user);
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

      {questions.length > 0 && (
        <div className="quiz-container">
          <h3 className="quiz-title"></h3>

          <ol className="quiz-list">
            {questions.map((q, i) => {
              const options = optionsMap[i] || [];
              const selected = selectedAnswers[i];
              const correct = results[i];

              return (
                <li key={i} className="quiz-item">
                  <p className="quiz-question">{q.question}</p>

                  <ul className="quiz-options">
                    {options.map((opt) => {
                      const isSelected = selected === opt;
                      const isCorrectAnswer = q.answer === opt;

                      let optionClass = "quiz-option";

                      if (selected !== undefined) {
                        if (isCorrectAnswer) {
                          optionClass += " correct";
                        }

                        if (isSelected && !isCorrectAnswer) {
                          optionClass += " incorrect";
                        }
                      }

                      return (
                        <li
                          key={`${i}-${opt}`}
                          className={optionClass}
                          onClick={(e) => {
                            e.preventDefault();
                            handleAnswer(i, opt);
                          }}
                        >
                          {opt}
                        </li>
                      );
                    })}
                  </ul>

                  {selected !== undefined && (
                    <p
                      className={`quiz-result ${
                        correct ? "success" : "failure"
                      }`}
                    >
                      {correct ? "Dobrze!" : "Źle!"}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
