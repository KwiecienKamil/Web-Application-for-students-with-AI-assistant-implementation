import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import supabase from "../../utils/supabase";
import type { Session } from "@supabase/supabase-js";

export type AuthState = {
  session: Session | null;
  loading: boolean;
  error: string | null;
  registrationSuccess: boolean;
};

const initialState: AuthState = {
  session: null,
  loading: false,
  error: null,
  registrationSuccess: false,
};

export const loginWithEmail = createAsyncThunk(
  "auth/loginWithEmail",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return thunkAPI.rejectWithValue(error.message);
    return data.session;
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await supabase.auth.signOut();
  return null;
});

export const registerWithEmail = createAsyncThunk(
  "auth/registerWithEmail",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return thunkAPI.rejectWithValue(error.message);
    }

    return { email };
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action) {
      state.session = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerWithEmail.fulfilled, (state) => {
        state.loading = false;
        state.registrationSuccess = true;
      })
      .addCase(registerWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.session = null;
      });
  },
});

export const { setSession } = authSlice.actions;
export default authSlice.reducer;
