import { Link, useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import type { User } from "../../features/auth/userSlice";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import "./sidebar.css";
import defaultUserImage from "../../assets/defaultUserImage.png";
import logo from "../../assets/logo_OT_t.png";
import { RiArrowLeftBoxFill } from "react-icons/ri";
import { Button } from "../Button/Button";

type SidebarProps = {
	user: User | null;
};

const Sidebar = ({ user }: SidebarProps) => {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);

	const signOut = async () => {
		await supabase.auth.signOut();
		navigate("/login");
	};

	// Some users have their full name, pick only first name
	const displayOnlyFirstName = user?.name?.split(" ")[0];

	return (
		<>
			<div id="sidebar-menu-button">
				<FiMenu onClick={() => setIsOpen((prev) => !prev)} />
			</div>
			<div id="sidebar-wrapper" className={isOpen ? "open" : ""}>
				<RiArrowLeftBoxFill
					id="sidebar-menu-close-button"
					onClick={() => setIsOpen((prev) => !prev)}
				/>
				<img src={logo} id="sidebar-logo" alt="Ogarnijto.org logo" />
				<div>
					<div id="sidebar-user-info">
						<img
							src={user?.picture ? user.picture : defaultUserImage}
							className="sidebar-user-image"
							alt="Zdjęcie użytkownika"
							referrerPolicy="no-referrer"
						/>
						<h1>{`Cześć ${user ? displayOnlyFirstName : ""}!`}</h1>
					</div>
					<nav>
						<ul>
							<li>
								<Link to="/platnosc">Płatność</Link>
							</li>
							<li>
								<button type="button" onClick={signOut} className="padding">
									Wyloguj się
								</button>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		</>
	);
};

export default Sidebar;
