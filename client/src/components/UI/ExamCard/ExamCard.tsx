import type { ExamData } from "../../../features/exams/ExamSlice";

// Pick only needed types from already created ExamData
type ExamCardProps = Pick<
  ExamData,
  "id" | "subject" | "date" | "term" | "note" | "completed"
>;

const ExamCard = ({ subject, date, term, note }: ExamCardProps) => {
  return (
    <div className="exam-card-wrapper">
      <div>
        <h4>{subject}</h4>
        <p>Data: {date}</p>
        <p>Termin: {term}</p>
        {note && <p>Notatka: {note}</p>}
      </div>
    </div>
  );
};

export default ExamCard;
