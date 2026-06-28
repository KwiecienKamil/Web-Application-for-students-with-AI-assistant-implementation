import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import InterfaceWrapper from "../../components/InterfaceWrapper/InterfaceWrapper";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import confetti from "canvas-confetti";
import "./home.css";
import {
	completeExamAsync,
	deleteExamAsync,
	fetchExams,
	updateExamAsync,
	type ExamData,
} from "../../features/exams/ExamSlice";
import ExamsDataSection from "../../components/ExamsDataSection/ExamsDataSection";
import AddExamForm from "../../components/UI/AddExamForm/AddExamForm";
import ModalPortal from "../../components/UI/ModalPortal/ModalPortal";
import type { HomeProps } from "../../types/HomeProps";

const Home = ({ session }: HomeProps) => {
	const dispatch = useAppDispatch();

	// Picking information from global store
	const user = useAppSelector((user) => user.user.user);
	const exams = useAppSelector((state) => state.exams.exams);

	// UseState for form modal functionality
	const [showForm, setShowForm] = useState(false);
	const [examToEdit, setExamToEdit] = useState<ExamData | null>(null);

	const handleEditExam = (exam: ExamData) => {
		setExamToEdit(exam);
		setShowForm(true);
	};

	const handleSaveExam = (exam: ExamData) => {
		if (!session?.access_token) return;

		dispatch(
			updateExamAsync({
				accessToken: session.access_token,
				exam,
			}),
		);

		setExamToEdit(null);
		setShowForm(false);
	};

	useEffect(() => {
		if (session?.access_token && exams.length === 0) {
			dispatch(fetchExams(session.access_token));
		}
	}, [session?.access_token, exams.length, dispatch]);

	const handleCompleteExam = (id: number, completed: boolean) => {
		if (!session?.access_token) return;

		dispatch(
			completeExamAsync({
				accessToken: session.access_token,
				id,
				completed,
			}),
		);
	};

	const handleDeleteExam = (id: number) => {
		if (!session?.access_token) return;

		dispatch(
			deleteExamAsync({
				accessToken: session.access_token,
				id,
			}),
		);
	};

	const triggerConfetti = () => {
		confetti({
			particleCount: 120,
			spread: 70,
			origin: { y: 0.6 },
		});
	};

	return (
		<InterfaceWrapper>
			<Sidebar user={user} />
			<ExamsDataSection
				exams={exams}
				onAddExam={() => {
					setExamToEdit(null);
					setShowForm(true);
				}}
				onUpdateExam={handleEditExam}
				onDeleteExam={handleDeleteExam}
				onCompleteExam={handleCompleteExam}
			/>
			{showForm && (
				<ModalPortal>
					<div
						id="add-exam-modal-overlay"
						onClick={() => {
							setShowForm(false);
							setExamToEdit(null);
						}}
					>
						<div onClick={(e) => e.stopPropagation()}>
							<AddExamForm
								accessToken={session?.access_token ?? ""}
								onClose={() => {
									setShowForm(false);
									setExamToEdit(null);
								}}
								initialData={examToEdit}
								onSubmit={handleSaveExam}
							/>
						</div>
					</div>
				</ModalPortal>
			)}
		</InterfaceWrapper>
	);
};

export default Home;
