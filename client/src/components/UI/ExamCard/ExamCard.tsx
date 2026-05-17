import type { ExamData } from "../../../features/exams/ExamSlice";
import "./exam-card.css";

import { SlOptionsVertical } from "react-icons/sl";

// Pick only needed types from already created ExamData
type ExamCardProps = Pick<
  ExamData,
  "id" | "subject" | "date" | "term" | "note" | "completed"
>;

const ExamCard = ({ subject, date, term, note }: ExamCardProps) => {
  return (
    <div className="exam-card-wrapper">
      <button className="exam-card-options-button">
        <SlOptionsVertical />
      </button>
      <div className="exam-card-data">
        <h4>{subject}</h4>
        <p>{date}</p>
        <p>
          Termin: <span>{term}</span>
        </p>
        {note && <p>Notatka: {note}</p>}
      </div>
    </div>
  );
};

export default ExamCard;
