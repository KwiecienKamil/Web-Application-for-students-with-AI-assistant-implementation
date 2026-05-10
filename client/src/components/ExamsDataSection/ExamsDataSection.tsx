import type { ExamData } from "../../features/exams/ExamSlice";
import "./exams-data-section.css";

type ExamsDataSectionProps = {
	exams: ExamData[];
};

const ExamsDataSection = ({ exams }: ExamsDataSectionProps) => {
	return (
		<section id="exams-section-wrapper">
			<button type="button">Dodaj egzamin</button>
			<div id="exams-data">
				<h3>Twoje egzaminy:</h3>
			</div>
		</section>
	);
};

export default ExamsDataSection;
