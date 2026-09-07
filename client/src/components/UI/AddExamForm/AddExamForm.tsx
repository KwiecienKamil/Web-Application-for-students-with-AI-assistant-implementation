import { useEffect, useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import "./add-exam-form.css";
import type { AppDispatch } from "../../../store";
import { addExam, type ExamData } from "../../../features/exams/ExamSlice";
import { Button } from "../../Button/Button";

type AddExamFormProps = {
  accessToken: string;
  onClose: () => void;
  initialData?: ExamData | null;
  onSubmit: (exam: ExamData) => void;
};

const formatDateForInput = (date: string) => date.slice(0, 10);

const AddExamForm = ({
  accessToken,
  onClose,
  initialData,
  onSubmit,
}: AddExamFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const isEditMode = !!initialData;

  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [term, setTerm] = useState<0 | 1 | 2 | 3>(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSubject(initialData.subject);
      setDate(formatDateForInput(initialData.date));
      setTerm(initialData.term);
      setNote(initialData.note ?? "");
      return;
    }

    setSubject("");
    setDate("");
    setTerm(1);
    setNote("");
  }, [initialData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!subject || !date) return;

    if (isEditMode && initialData) {
      onSubmit({
        ...initialData,
        subject,
        date,
        term,
        note,
      });
      onClose();
      return;
    }

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
      <Button type="submit" disabled={loading}>
        {loading
          ? isEditMode
            ? "Zapisywanie..."
            : "Dodawanie..."
          : isEditMode
            ? "Zapisz zmiany"
            : "Dodaj egzamin"}
      </Button>
    </form>
  );
};

export default AddExamForm;
