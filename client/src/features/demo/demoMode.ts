import { createAsyncThunk } from "@reduxjs/toolkit";
import { setExams } from "../exams/ExamSlice";
import { setQuizResults } from "../quizes/QuizResultsSlice";
import { setUser, clearUser } from "../auth/userSlice";
import {
	DEMO_STORAGE_KEY,
	createDemoSession,
	demoExams,
	demoQuizResults,
	demoUser,
} from "./demoData";

export const enterDemoMode = createAsyncThunk(
	"demo/enter",
	async (_, { dispatch }) => {
		localStorage.setItem(DEMO_STORAGE_KEY, "1");
		dispatch(setUser(demoUser));
		dispatch(setExams(demoExams));
		dispatch(setQuizResults(demoQuizResults));
		return createDemoSession();
	},
);

export const exitDemoMode = createAsyncThunk(
	"demo/exit",
	async (_, { dispatch }) => {
		localStorage.removeItem(DEMO_STORAGE_KEY);
		dispatch(clearUser());
		dispatch(setExams([]));
		dispatch(setQuizResults([]));
	},
);