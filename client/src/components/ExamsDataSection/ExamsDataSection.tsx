import type { ExamData } from "../../features/exams/ExamSlice";
import ExamCard from "../UI/ExamCard/ExamCard";
import "./exams-data-section.css";

type ExamsDataSectionProps = {
  exams: ExamData[];
  onAddExam: () => void;
};

const ExamsDataSection = ({ exams, onAddExam }: ExamsDataSectionProps) => {
  return (
    <section id="exams-section-wrapper">
      <button type="button" onClick={onAddExam} id="add-exam-button">
        Dodaj egzamin
      </button>
      <div id="exams-data">
        <h3>Twoje egzaminy:</h3>

        {exams.length === 0 ? (
          <p>Brak egzaminów</p>
        ) : (
          exams.map((exam) => (
            <ExamCard
              key={exam.id}
              id={exam.id}
              subject={exam.subject}
              date={exam.date}
              term={exam.term}
              note={exam.note}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default ExamsDataSection;
