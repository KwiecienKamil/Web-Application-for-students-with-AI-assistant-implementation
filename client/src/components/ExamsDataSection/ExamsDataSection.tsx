import type { ExamData } from "../../features/exams/ExamSlice";
import "./exams-data-section.css";

type ExamsDataSectionProps = {
  exams: ExamData[];
  onAddExam: () => void;
};

const ExamsDataSection = ({ exams, onAddExam }: ExamsDataSectionProps) => {
  return (
    <section id="exams-section-wrapper">
      <button type="button" onClick={onAddExam}>
        Dodaj egzamin
      </button>
      <div id="exams-data">
        <h3>Twoje egzaminy:</h3>

        {exams.length === 0 ? (
          <p>Brak egzaminów</p>
        ) : (
          <ul>
            {exams.map((exam) => (
              <li key={exam.id}>
                <h4>{exam.subject}</h4>
                <p>Data: {exam.date}</p>
                <p>Termin: {exam.term}</p>

                {exam.note && <p>Notatka: {exam.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ExamsDataSection;
