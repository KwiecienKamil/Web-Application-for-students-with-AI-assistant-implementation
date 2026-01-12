import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { setSession } from "../features/auth/authSlice";
import type { Session } from "@supabase/supabase-js";
import supabase from "../utils/supabase";

export const useSupabaseAuth = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initAuth = async () => {
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
      dispatch(setSession(session as Session | null));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);
};
