import type { ExamData } from "../../features/exams/ExamSlice";
import { useExportPDF } from "../../hooks/useExportPDF/useExportPDF";
import { Button } from "../Button/Button";
import ExamCard from "../UI/ExamCard/ExamCard";
import "./exams-data-section.css";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type ExamsDataSectionProps = {
  exams: ExamData[];
  onAddExam: () => void;
  onUpdateExam: (exam: ExamData) => void;
  onDeleteExam: (id: number) => void;
  onCompleteExam: (id: number, completed: boolean) => void;
};

const ExamsDataSection = ({
  exams,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  onCompleteExam,
}: ExamsDataSectionProps) => {
  const { exportToPDF } = useExportPDF(exams);
  const completedExams = exams.filter((exam) => exam.completed).length;
  const incompleteExams = exams.filter((exam) => !exam.completed).length;
  const chartData = [
    {
      name: "Zakończone",
      value: completedExams,
    },
    {
      name: "Niezakończone",
      value: incompleteExams,
    },
  ];

  return (
    <section className="main-section-wrapper">
      <Button variant="primary" onClick={onAddExam} id="add-exam-button">
        Dodaj egzamin
      </Button>
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
              completed={exam.completed}
              onEdit={() => onUpdateExam(exam)}
              onDelete={onDeleteExam}
              onComplete={onCompleteExam}
            />
          ))
        )}
      </div>
      <Button variant="feature" id="export-exams-button" onClick={exportToPDF}>
        Eksportuj egzaminy do PDF
      </Button>
      {exams.length > 0 && (
        <div className="exams-chart">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "Zakończone",
                    value: exams.filter((exam) => exam.completed).length,
                  },
                  {
                    name: "Niezakończone",
                    value: exams.filter((exam) => !exam.completed).length,
                  },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={105}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#1aaa1a" />
                <Cell fill="#111827" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default ExamsDataSection;
