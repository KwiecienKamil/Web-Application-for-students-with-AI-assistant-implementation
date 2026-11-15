import type { Session } from "@supabase/supabase-js";
import type { QuizAnswerDetails } from "../../types/QuizGeneratorTypes";
import type { User } from "../../types/UserProps";
import type { ExamData } from "../exams/ExamSlice";
import type { QuizResult } from "../quizes/QuizResultsSlice";

export const DEMO_STORAGE_KEY = "ogarnijto_demo_mode";

export const demoUser: User = {
	id: "demo-recruiter",
	email: "demo@ogarnijto.org",
	name: "Gość (demo)",
	picture: null,
	isPremium: true,
	terms_accepted: true,
	isBetaTester: false,
	isProfilePublic: false,
};

export const demoExams: ExamData[] = [
	{
		id: 1,
		subject: "Matematyka",
		date: "2026-06-15",
		term: 1,
		note: "Analiza — powtórka wzorów",
		user_id: 0,
		completed: true,
	},
	{
		id: 2,
		subject: "Fizyka",
		date: "2026-06-08",
		term: 2,
		note: "Mechanika klasyczna",
		user_id: 0,
		completed: false,
	},
	{
		id: 3,
		subject: "Programowanie obiektowe",
		date: "2026-05-20",
		term: 1,
		note: "Wzorce projektowe",
		user_id: 0,
		completed: true,
	},
	{
		id: 4,
		subject: "Bazy danych",
		date: "2026-07-01",
		term: 3,
		note: "SQL i normalizacja",
		user_id: 0,
		completed: false,
	},
];

export const demoQuizResults: QuizResult[] = [
	{
		id: 1,
		date: "2026-09-05 13:55:00",
		score: 12,
		total_questions: 15,
		percentage: 80,
	},
	{
		id: 2,
		date: "2026-08-02 13:26:00",
		score: 7,
		total_questions: 15,
		percentage: 47,
	},
];

export const demoQuizDetailsById: Record<number, QuizAnswerDetails[]> = {
	1: [
		{
			question: "Czym jest asynchroniczność w JavaScript?",
			correct_answer:
				"Obsługa operacji bez blokowania wątku głównego (callback, Promise, async/await).",
			user_answer:
				"Obsługa operacji bez blokowania wątku głównego (callback, Promise, async/await).",
			is_correct: 1,
		},
		{
			question: "Co to jest hoisting w JavaScript?",
			correct_answer:
				"Mechanizm przenoszenia deklaracji zmiennych i funkcji na początek zakresu.",
			user_answer: "Podnoszenie tylko funkcji strzałkowych.",
			is_correct: 0,
		},
	],
	2: [
		{
			question: "Czym różni się let od const?",
			correct_answer: "const nie pozwala na ponowne przypisanie referencji.",
			user_answer: "const nie pozwala na ponowne przypisanie referencji.",
			is_correct: 1,
		},
	],
};

export const createDemoSession = (): Session =>
	({
		access_token: "demo-access-token",
		refresh_token: "demo-refresh-token",
		expires_in: 86_400,
		expires_at: Math.floor(Date.now() / 1000) + 86_400,
		token_type: "bearer",
		user: {
			id: demoUser.id,
			email: demoUser.email,
			app_metadata: { provider: "email" },
			user_metadata: { name: demoUser.name },
			aud: "authenticated",
			created_at: new Date().toISOString(),
		},
	}) as Session;