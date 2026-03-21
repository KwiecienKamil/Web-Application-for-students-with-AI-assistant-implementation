import { Link, useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import { useEffect } from "react";
import { fetchUser } from "../../features/auth/userSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";



const Home = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((user) => user.user.user)

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  useEffect(() => {
    dispatch(fetchUser());
  }, []);

  return (
    <div >
      <h1>{`Witaj w aplikacji! ${user ? user.name : ""}`}</h1>
      <button onClick={signOut}>
        Wyloguj się
      </button>
      <Link to="/platnosc">Platnosc</Link>
    </div>
  );
};

export default Home;
