import { useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import "./add-exam-form.css";
import type { AppDispatch } from "../../../store";
import { addExam } from "../../../features/exams/ExamSlice";

type AddExamFormProps = {
  accessToken: string;
  onClose: () => void;
};

const AddExamForm = ({ accessToken, onClose }: AddExamFormProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [term, setTerm] = useState<0 | 1 | 2 | 3>(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!subject || !date) return;

    try {
      setLoading(true);

      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/exams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          subject,
          date,
          term,
          note,
        }),
      });

      if (!res.ok) {
        throw new Error("Błąd dodawania egzaminu");
      }

      const newExam = await res.json();
      dispatch(addExam(newExam));
      setSubject("");
      setDate("");
      setTerm(1);
      setNote("");
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="add-exam-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="subject">Przedmiot</label>
        <input
          id="subject"
          type="text"
          placeholder=""
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">Data egzaminu</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="term">Termin</label>
        <select
          id="term"
          value={term}
          onChange={(e) => setTerm(Number(e.target.value) as 0 | 1 | 2 | 3)}
        >
          <option value={1}>1 termin</option>
          <option value={2}>2 termin</option>
          <option value={3}>3 termin</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="note">Notatka</label>
        <textarea
          id="note"
          placeholder=""
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Dodawanie..." : "Dodaj egzamin"}
      </button>
    </form>
  );
};

export default AddExamForm;
