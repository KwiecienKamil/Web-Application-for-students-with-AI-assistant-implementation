import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export interface ExamData {
  id: number;
  subject: string;
  date: string;
  term: 0 | 1 | 2 | 3;
  note: string;
  user_id: number;
  completed?: boolean;
}

interface ExamsState {
  exams: ExamData[];
  loading: boolean;
  error: string | null;
}

const initialState: ExamsState = {
  exams: [],
  loading: false,
  error: null,
};

export const fetchExams = createAsyncThunk<ExamData[], string>(
  "exams/fetchExams",
  async (accessToken, thunkAPI) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/exams`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Nie udało się pobrać egzaminów");
      }

      return await res.json();
    } catch (error) {
      return thunkAPI.rejectWithValue("Błąd pobierania egzaminów");
    }
  },
);

export const updateExamAsync = createAsyncThunk<
  ExamData,
  { accessToken: string; exam: ExamData }
>("exams/updateExam", async ({ accessToken, exam }, thunkAPI) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/exams/${exam.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(exam),
      },
    );

    if (!res.ok) throw new Error();

    return await res.json();
  } catch {
    return thunkAPI.rejectWithValue("Błąd update");
  }
});

export const deleteExamAsync = createAsyncThunk<
  number,
  { accessToken: string; id: number }
>("exams/deleteExam", async ({ accessToken, id }, thunkAPI) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/exams/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) throw new Error();

    return id;
  } catch {
    return thunkAPI.rejectWithValue("Błąd delete");
  }
});

const examSlice = createSlice({
  name: "exams",
  initialState,
  reducers: {
    addExam: (state, action: PayloadAction<ExamData>) => {
      state.exams.push(action.payload);
    },

    removeExam: (state, action: PayloadAction<number>) => {
      state.exams = state.exams.filter((exam) => exam.id !== action.payload);
    },

    setExams: (state, action: PayloadAction<ExamData[]>) => {
      state.exams = action.payload;
    },

    updateExam: (state, action: PayloadAction<ExamData>) => {
      const index = state.exams.findIndex((e) => e.id === action.payload.id);

      if (index !== -1) {
        state.exams[index] = action.payload;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.loading = false;
        state.exams = action.payload;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Błąd pobierania egzaminów";
      })
      .addCase(updateExamAsync.fulfilled, (state, action) => {
        const index = state.exams.findIndex((e) => e.id === action.payload.id);

        if (index !== -1) {
          state.exams[index] = action.payload;
        }
      })

      .addCase(deleteExamAsync.fulfilled, (state, action) => {
        state.exams = state.exams.filter((e) => e.id !== action.payload);
      });
  },
});

export const { addExam, removeExam, setExams, updateExam } = examSlice.actions;

export default examSlice.reducer;
