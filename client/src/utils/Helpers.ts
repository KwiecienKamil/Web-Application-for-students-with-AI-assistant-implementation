import { MdWorkspacePremium, MdQuiz, MdAddHomeWork } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { TbShieldSearch } from "react-icons/tb";

export const navLinks = [
  {
    id: 1,
    title: "Strona Główna",
    link: "/",
    icon: MdAddHomeWork,
  },
  {
    id: 2,
    title: "Generator Quizów",
    link: "/quiz",
    icon: MdQuiz,
  },
  {
    id: 3,
    title: "Kup Premium",
    link: "/platnosc",
    icon: MdWorkspacePremium,
  },
  {
    id: 4,
    title: "Ustawienia",
    link: "/ustawienia",
    icon: IoMdSettings,
  },
  {
    id: 5,
    title: "Regulamin",
    link: "/legal",
    icon: TbShieldSearch,
  },
];
