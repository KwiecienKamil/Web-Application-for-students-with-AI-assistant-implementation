import { Link, useNavigate } from 'react-router-dom'
import supabase from '../../utils/supabase';
import type { User } from '../../features/auth/userSlice';
import { useEffect, useRef, useState } from 'react';
import { FiMenu } from "react-icons/fi";
import "./sidebar.css"
import defaultUserImage from "../../assets/defaultUserImage.png"
import logo from "../../assets/logo_OT_t.png"

type SidebarProps = {
    user: User | null;
}

const Sidebar = ({user}: SidebarProps) => {
    const navigate = useNavigate();
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    
    const signOut = async () => {
        await supabase.auth.signOut();
        navigate("/login");
      };

    useEffect(() => {
        if (!sidebarRef.current) return;

        if (isOpen) {
            sidebarRef.current.classList.add("open");
        } else {
            sidebarRef.current.classList.remove("open");
        }
    }, [isOpen]);


  return (
    <>
        <FiMenu
        id="sidebar-menu-button"
          onClick={() => setIsOpen(!isOpen)}
        />
    <div 
    id="sidebar-wrapper"
    ref={sidebarRef}
    >
    <img src={logo} 
    id="sidebar-logo"
    alt="Ogarnijto.org logo" />
    <div id="sidebar-user-info">
        <img 
        src={user?.picture ? user.picture : defaultUserImage} 
        className="sidebar-user-image"
        alt="Zdjęcie użytkownika" />
        <h1>{`Cześć ${user ? user.name : ""}!`}</h1>
    </div>
      <button onClick={signOut}>
        Wyloguj się
      </button>
      <Link to="/platnosc">Platnosc</Link>
    </div>
    </>
  )
}

export default Sidebar