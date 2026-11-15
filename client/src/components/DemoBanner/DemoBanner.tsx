import { Link, useNavigate } from "react-router-dom";
import { exitDemoMode } from "../../features/demo/demoMode";
import { useAppDispatch } from "../../store/hooks";
import "./demo-banner.css";

const DemoBanner = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const handleExitDemo = async (e: React.MouseEvent) => {
		e.preventDefault();
		await dispatch(exitDemoMode());
		navigate("/login");
	};

	return (
		<div className="demo-banner" role="status">
			<span>Tryb demonstracyjny — zmiany nie są zapisywane na serwerze.</span>
			<Link to="/login" onClick={handleExitDemo}>
				Wróć do logowania
			</Link>
		</div>
	);
};

export default DemoBanner;