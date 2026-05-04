import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import InterfaceWrapper from "../../components/InterfaceWrapper/InterfaceWrapper";
import Sidebar from "../../components/Sidebar/Sidebar";
import { fetchUser } from "../../features/auth/userSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import "./home.css";
import { fetchExams } from "../../features/exams/ExamSlice";
type HomeProps = {
  session: Session | null;
};

const Home = ({ session }: HomeProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((user) => user.user.user);
  const exams = useAppSelector((state) => state.exams.exams);

  useEffect(() => {
    if (session && !user) {
      dispatch(fetchUser());
    }
  }, [session, user, dispatch]);

  useEffect(() => {
    if (session?.access_token && exams.length === 0) {
      dispatch(fetchExams(session.access_token));
    }
  }, [session?.access_token, exams.length, dispatch]);

  return (
    <InterfaceWrapper>
      <Sidebar user={user} />
      <section id="exams-section-wrapper"></section>
    </InterfaceWrapper>
  );
};

export default Home;
