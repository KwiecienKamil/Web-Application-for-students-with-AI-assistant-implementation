import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QuizResult {
	id: number;
	date: string;
	percentage: number;
	score: number;
	total_questions: number;
}

interface QuizResultsState {
	results: QuizResult[];
	loading: boolean;
	error: string | null;
}

const initialState: QuizResultsState = {
	results: [],
	loading: false,
	error: null,
};

export const fetchQuizResults = createAsyncThunk<
	QuizResult[],
	string,
	{ rejectValue: string }
>("quizResults/fetchQuizResults", async (accessToken, thunkAPI) => {
	try {
		const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/quiz-results`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!res.ok) {
			return thunkAPI.rejectWithValue("Błąd pobierania wyników quizu");
		}

		return await res.json();
	} catch {
		return thunkAPI.rejectWithValue("Błąd pobierania wyników quizu");
	}
});

const quizResultsSlice = createSlice({
	name: "quizResults",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchQuizResults.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(
				fetchQuizResults.fulfilled,
				(state, action: PayloadAction<QuizResult[]>) => {
					state.loading = false;
					state.results = action.payload;
				},
			)
			.addCase(fetchQuizResults.rejected, (state, action) => {
				state.loading = false;
				state.error =
					(action.payload as string) ?? action.error.message ?? null;
			});
	},
});

export default quizResultsSlice.reducer;
