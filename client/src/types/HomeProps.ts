import type { Session } from "@supabase/supabase-js";
import type { User } from "../features/auth/userSlice";

export type HomeProps = {
  session: Session | null;
};
