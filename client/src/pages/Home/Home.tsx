import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import InterfaceWrapper from "../../components/InterfaceWrapper/InterfaceWrapper";
import Sidebar from "../../components/Sidebar/Sidebar";
import { fetchUser } from "../../features/auth/userSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import "./home.css";
import {
  deleteExamAsync,
  fetchExams,
  updateExamAsync,
  type ExamData,
} from "../../features/exams/ExamSlice";
import ExamsDataSection from "../../components/ExamsDataSection/ExamsDataSection";
import AddExamForm from "../../components/UI/AddExamForm/AddExamForm";
import ModalPortal from "../../components/UI/ModalPortal/ModalPortal";

type HomeProps = {
  session: Session | null;
};

const Home = ({ session }: HomeProps) => {
  const dispatch = useAppDispatch();

  // Picking information from global store
  const user = useAppSelector((user) => user.user.user);
  const exams = useAppSelector((state) => state.exams.exams);

  // UseState for form modal functionality
  const [showForm, setShowForm] = useState(false);

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

  const handleUpdateExam = (exam: ExamData) => {
    if (!session?.access_token) return;

    dispatch(
      updateExamAsync({
        accessToken: session.access_token,
        exam,
      }),
    );
  };

  const handleDeleteExam = (id: number) => {
    if (!session?.access_token) return;

    dispatch(
      deleteExamAsync({
        accessToken: session.access_token,
        id,
      }),
    );
  };

  return (
    <InterfaceWrapper>
      <Sidebar user={user} />
      <ExamsDataSection
        exams={exams}
        onAddExam={() => setShowForm(true)}
        onUpdateExam={handleUpdateExam}
        onDeleteExam={handleDeleteExam}
      />
      {showForm && (
        <ModalPortal>
          <div id="add-exam-modal-overlay" onClick={() => setShowForm(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <AddExamForm
                accessToken={session?.access_token ?? ""}
                onClose={() => setShowForm(false)}
              />
            </div>
          </div>
        </ModalPortal>
      )}
    </InterfaceWrapper>
  );
};

export default Home;
