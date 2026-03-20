import { Link, useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import { fetchUser } from "../../features/auth/userSlice";
import { useAppDispatch } from "../../store/hooks";

interface HomeProps {
  session: Session | null;
}

const Home = ({ session }: HomeProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const name =
    session?.user.identities?.[0]?.identity_data?.full_name ||
    session?.user.email ||
    "";

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  useEffect(() => {
    dispatch(fetchUser());
  }, []);

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", textAlign: "center" }}>
      <h1>{`Witaj w aplikacji! ${name ? name : ""}`}</h1>
      <button onClick={signOut} style={{ padding: "10px 20px", fontSize: 16 }}>
        Wyloguj się
      </button>
      <Link to="/platnosc">Platnosc</Link>
    </div>
  );
};

export default Home;
