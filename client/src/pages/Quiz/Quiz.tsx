import InterfaceWrapper from "../../components/InterfaceWrapper/InterfaceWrapper";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAppSelector } from "../../store/hooks";

const Quiz = () => {
  const user = useAppSelector((user) => user.user.user);
  return (
    <InterfaceWrapper>
      <Sidebar user={user} />
      <div className="main-section-wrapper">X</div>
    </InterfaceWrapper>
  );
};

export default Quiz;
