import { Link, useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import { useEffect } from "react";
import { fetchUser } from "../../features/auth/userSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { Session } from "@supabase/supabase-js";
import InterfaceWrapper from "../../components/InterfaceWrapper/InterfaceWrapper";
import Sidebar from "../../components/Sidebar/Sidebar";

type HomeProps = {
  session: Session | null;
};

const Home = ({session} : HomeProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((user) => user.user.user);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  useEffect(() => {
  if (session && !user) {
    dispatch(fetchUser());
  }
}, [session, user, dispatch]);

  return (
    <InterfaceWrapper>
      <Sidebar user={user}/>
    </InterfaceWrapper>
  );
};

export default Home;
