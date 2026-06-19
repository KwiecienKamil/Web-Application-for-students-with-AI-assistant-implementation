import type { QA, QuizPDFReaderProps } from "../../types/QuizGeneratorTypes";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "./quiz-pdf-reader.css";
import brain from "../../assets/quiz_brain.png";

GlobalWorkerOptions.workerSrc = pdfWorker;

const QuizPDFReader = ({
	user,
	setLoading,
	setQuestions,
	setSelectedAnswers,
	setResults,
	setOptionsMap,
}: QuizPDFReaderProps) => {
	const shuffle = <T,>(arr: T[]): T[] => {
		const array = [...arr];
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	};

	async function generateQuizFromText(text: string): Promise<QA[]> {
		const response = await fetch(
			`${import.meta.env.VITE_SERVER_URL}/generate-quiz`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text }),
			},
		);

		if (!response.ok) {
			throw new Error("Błąd generowania quizu");
		}

		const data = await response.json();

		const questions = data?.quizItems?.questions;

		if (!Array.isArray(questions)) {
			console.error("Niepoprawna odpowiedź API:", data);
			throw new Error("Serwer nie zwrócił listy pytań");
		}

		return questions;
	}

	const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const demoUsed = localStorage.getItem("demo_quiz_used");
		if (user?.google_id === "demo123" && demoUsed) {
			alert("Wersja demo pozwala wygenerować quiz tylko raz");
			return;
		}

		const file = e.target.files?.[0];
		if (!file) return;

		setLoading(true);
		setQuestions([]);
		setSelectedAnswers({});
		setResults({});
		setOptionsMap({});

		const reader = new FileReader();

		reader.onload = async function () {
			const typedArray = new Uint8Array(this.result as ArrayBuffer);
			const pdf = await getDocument({ data: typedArray }).promise;

			let fullText = "";
			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const content = await page.getTextContent();
				const strings = content.items.map((item: any) => item.str);
				fullText += strings.join(" ") + "\n";
			}

			fullText = fullText.replace(/\r/g, "").replace(/\n\s*\n/g, "\n");

			try {
				const quizItems = (await generateQuizFromText(fullText)) as QA[];
				const shuffledQuiz = shuffle(quizItems);

				const optionsMap: Record<number, string[]> = {};

				shuffledQuiz.forEach((question, questionIndex) => {
					const correctAnswer = question.answer;

					const otherAnswers = shuffledQuiz
						.filter(
							(_, otherQuestionIndex) => otherQuestionIndex !== questionIndex,
						)
						.map((otherQuestion) => otherQuestion.answer);

					const randomIncorrectAnswers = shuffle(otherAnswers).slice(0, 3);

					optionsMap[questionIndex] = shuffle([
						correctAnswer,
						...randomIncorrectAnswers,
					]);
				});

				setQuestions(shuffledQuiz);
				setOptionsMap(optionsMap);
			} catch (error) {
				console.error("Błąd generowania quizu dla użytkownika", error);
				setQuestions([]);
			} finally {
				setLoading(false);
			}

			setLoading(false);
		};

		reader.readAsArrayBuffer(file);
	};
	return (
		<div className="quiz-component-wrapper">
			<div className="quiz-component-image">
				<img src={brain} alt="brain emoji" />
			</div>
			<div className="quiz-component-copy">
				<h2>
					Generator quizu <span>AI</span>
				</h2>
				<p>Ekspresowo wygeneruj quiz z pliku PDF!</p>
				<input
					id="file-upload"
					type="file"
					accept="application/pdf"
					onChange={handlePDFUpload}
				/>
			</div>
		</div>
	);
};

export default QuizPDFReader;
