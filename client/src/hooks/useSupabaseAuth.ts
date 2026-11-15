import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSession } from "../features/auth/authSlice";
import { clearUser } from "../features/auth/userSlice";
import { enterDemoMode } from "../features/demo/demoMode";
import { DEMO_STORAGE_KEY } from "../features/demo/demoData";
import type { AppDispatch } from "../store";
import supabase from "../utils/supabase";

export const useSupabaseAuth = () => {
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		const initAuth = async () => {
			if (localStorage.getItem(DEMO_STORAGE_KEY) === "1") {
				dispatch(enterDemoMode());
				return;
			}

			const { data, error } = await supabase.auth.getSession();
			if (error) {
				console.error(error);
				return;
			}
			dispatch(setSession(data.session as Session | null));
		};

		initAuth();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (localStorage.getItem(DEMO_STORAGE_KEY) === "1") {
				return;
			}

			dispatch(setSession(session as Session | null));
			if (!session) {
				dispatch(clearUser());
			}
		});

		return () => subscription.unsubscribe();
	}, [dispatch]);
};
