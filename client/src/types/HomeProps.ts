import type { Session } from "@supabase/supabase-js";

export type HomeProps = {
  session: Session | null;
};
