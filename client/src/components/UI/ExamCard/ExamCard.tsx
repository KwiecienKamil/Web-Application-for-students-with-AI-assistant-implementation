import { useState } from "react";
import type { ExamData } from "../../../features/exams/ExamSlice";
import "./exam-card.css";

import { SlOptionsVertical } from "react-icons/sl";

// Pick only needed types from already created ExamData
type ExamCardProps = Pick<
  ExamData,
  "id" | "subject" | "date" | "term" | "note" | "completed"
> & {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

const ExamCard = ({
  id,
  subject,
  date,
  term,
  note,
  onEdit,
  onDelete,
}: ExamCardProps) => {
  const [open, setOpen] = useState(false);

  // Change date format from YYYY/MM/DD to DD.MM.YYYY
  const formattedDate = new Date(date).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="exam-card-wrapper">
      <button
        className="exam-card-options-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <SlOptionsVertical />
      </button>
      <div className="exam-card-data">
        {open && (
          <div className="exam-card-options">
            <button
              onClick={() => {
                onEdit(id);
                setOpen(false);
              }}
            >
              Edytuj
            </button>

            <button
              onClick={() => {
                onDelete(id);
                setOpen(false);
              }}
            >
              Usuń
            </button>
          </div>
        )}
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
