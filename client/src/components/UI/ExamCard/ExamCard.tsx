import type { ExamData } from "../../../features/exams/ExamSlice";
import "./exam-card.css";

import { SlOptionsVertical } from "react-icons/sl";

// Pick only needed types from already created ExamData
type ExamCardProps = Pick<
  ExamData,
  "id" | "subject" | "date" | "term" | "note" | "completed"
>;

const ExamCard = ({ subject, date, term, note }: ExamCardProps) => {
  // Change date format from YYYY/MM/DD to DD.MM.YYYY
  const formattedDate = new Date(date).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="exam-card-wrapper">
      <button className="exam-card-options-button">
        <SlOptionsVertical />
      </button>
      <div className="exam-card-data">
        <span className="exam-card-data-date">{formattedDate}</span>
        <div className="exam-card-data-term-wrapper">
          <p>Termin:</p>
          <div className="exam-card-data-term">
            <span>{term}</span>
          </div>
        </div>
        <h4>{subject}</h4>
        {note && <p>{note}</p>}
      </div>
    </div>
  );
};

export default ExamCard;
