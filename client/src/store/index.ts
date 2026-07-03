import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/auth/userSlice";
import examReducer from "../features/exams/ExamSlice";
import quizReducer from "../features/quizes/QuizResultsSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		user: userReducer,
		exams: examReducer,
		quizes: quizReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
