import type { ExamData } from "../../features/exams/ExamSlice";
import ExamCard from "../UI/ExamCard/ExamCard";
import "./exams-data-section.css";

type ExamsDataSectionProps = {
  exams: ExamData[];
  onAddExam: () => void;
  onUpdateExam: (exam: ExamData) => void;
  onDeleteExam: (id: number) => void;
};

const ExamsDataSection = ({
  exams,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
}: ExamsDataSectionProps) => {
  return (
    <section id="exams-section-wrapper">
      <button type="button" onClick={onAddExam} id="add-exam-button">
        Dodaj egzamin
      </button>
      <h3>Twoje egzaminy:</h3>
      <div id="exams-data">
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
              onEdit={(id) => {
                const exam = exams.find((e) => e.id === id);
                if (exam) onUpdateExam(exam);
              }}
              onDelete={onDeleteExam}
            />
          ))
        )}
      </div>
      <button id="export-exams-button">Eksportuj egzaminy do PDF</button>
    </section>
  );
};

export default ExamsDataSection;
