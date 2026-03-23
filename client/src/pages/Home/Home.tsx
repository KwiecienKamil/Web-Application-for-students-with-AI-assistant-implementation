import { useEffect } from "react";
import { fetchUser } from "../../features/auth/userSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { Session } from "@supabase/supabase-js";
import InterfaceWrapper from "../../components/InterfaceWrapper/InterfaceWrapper";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./home.css"
import { fetchExams } from "../../features/exams/ExamSlice";

type HomeProps = {
  session: Session | null;
};

const Home = ({session} : HomeProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((user) => user.user.user);
   const exams = useAppSelector((state) => state.exams.exams);

useEffect(() => {
  if (session && !user) {
    dispatch(fetchUser());
  }
}, [session, user, dispatch]);


   useEffect(() => {
  if (user?.id && exams.length === 0 && session?.access_token) {
    dispatch(fetchExams(session.access_token));
  }
}, [user, exams.length, session, dispatch]);



  return (
    <InterfaceWrapper>
      <Sidebar user={user}/>
      <section id="exams-section-wrapper">

      </section>
    </InterfaceWrapper>
  );
};

export default Home;
