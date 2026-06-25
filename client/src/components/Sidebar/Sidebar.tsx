import { NavLink, useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import "./sidebar.css";
import defaultUserImage from "../../assets/defaultUserImage.png";
import logo from "../../assets/logo_OT_t.png";
import { RiArrowLeftBoxFill } from "react-icons/ri";
import { navLinks } from "../../utils/Helpers";
import { BiLogOutCircle } from "react-icons/bi";
import type { User } from "../../types/UserProps";

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
						<div>
							<h1>{`Cześć${user?.name ? "," : ""} ${user?.name ? displayOnlyFirstName : ""} !`}</h1>
							{user?.isPremium ? (
								<p>
									Konto <span id="premium">Premium</span>
								</p>
							) : (
								<p>Konto Zwykłe</p>
							)}
						</div>
					</div>
					<nav>
						<ul>
							{navLinks.map((navLink) => {
								const Icon = navLink.icon;
								return (
									<li key={navLink.id}>
										<NavLink
											to={navLink.link}
											className={({ isActive }) => (isActive ? "active" : "")}
										>
											<Icon />
											{navLink.title}
										</NavLink>
									</li>
								);
							})}
							<li>
								<button type="button" onClick={signOut}>
									<BiLogOutCircle />
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
