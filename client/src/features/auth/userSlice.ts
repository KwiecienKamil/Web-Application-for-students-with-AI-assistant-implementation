import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type User = {
	id: string;
	email: string;
	name: string | null;
	picture: string | null;
	is_premium: boolean;
	terms_accepted: boolean;
	isBetaTester: boolean;
	isProfilePublic: boolean;
};

type UserState = {
	user: User | null;
	loading: boolean;
	error: string | null;
};

const initialState: UserState = {
	user: null,
	loading: false,
	error: null,
};

export const fetchUser = createAsyncThunk(
	"user/fetchUser",
	async (_, thunkAPI) => {
		const state: any = thunkAPI.getState();
		const token = state.auth.session?.access_token;

		const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/getUser`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!res.ok) {
			throw new Error("Failed to fetch user");
		}

		return await res.json();
	},
);

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		clearUser(state) {
			state.user = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUser.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload;
			})
			.addCase(fetchUser.rejected, (state) => {
				state.loading = false;
			});
	},
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
