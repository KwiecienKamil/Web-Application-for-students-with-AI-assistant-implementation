import type { ReactNode } from "react";
import { useAppSelector } from "../../store/hooks";
import DemoBanner from "../DemoBanner/DemoBanner";
import "./interface-wrapper.css";

type WrapperProps = {
	children: ReactNode;
};

const InterfaceWrapper = ({ children }: WrapperProps) => {
	const isDemoMode = useAppSelector((state) => state.auth.isDemoMode);

	return (
		<div id="interface-wrapper">
			{isDemoMode ? <DemoBanner /> : null}
			<div className="interface-wrapper-main">{children}</div>
		</div>
	);
};

export default InterfaceWrapper;
