import { Navigate } from "react-router-dom";
import InterfaceWrapper from "../../components/InterfaceWrapper/InterfaceWrapper";
import Sidebar from "../../components/Sidebar/Sidebar";
import SettingsForm from "../../components/UI/SettingsForm/SettingsForm";
import "../../components/ExamsDataSection/exams-data-section.css";
import { useAppSelector } from "../../store/hooks";
import type { HomeProps } from "../../types/HomeProps";

const Settings = ({ session }: HomeProps) => {
	const user = useAppSelector((state) => state.user.user);

	if (!session) return <Navigate to="/login" replace />;

	return (
		<InterfaceWrapper>
			<Sidebar user={user} />
			<div className="main-section-wrapper">
				<SettingsForm accessToken={session.access_token} user={user} />
			</div>
		</InterfaceWrapper>
	);
};

export default Settings;
