import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";

const authCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const user = data.session.user;

        await supabase.from("users").upsert({
          id: user.id,
          email: user.email,
        });

        navigate("/");
      } else {
        navigate("/login");
      }
    });
  }, []);

  return <p>Potwierdzanie konta...</p>;
};

export default authCallback;
