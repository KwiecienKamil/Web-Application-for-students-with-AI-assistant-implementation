import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginWithEmail } from "../../features/auth/authSlice";
import supabase from "../../utils/supabase";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import UserAuthWrapper from "../../components/UserAuthWrapper/UserAuthWrapper";
import { Button } from "../../components/Button/Button";
import logo from "../../assets/logo-ot.png"
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const dispatch = useAppDispatch();
   const navigate = useNavigate();
  const { loading, error, session } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) alert("Błąd logowania: " + error.message);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginWithEmail({ email, password }));
  };

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  return (
    <UserAuthWrapper>
      <div className="auth-form">
        <div className="auth-title">
        <img src={logo} alt="Ogarnijto.org" />
        <h2>Witamy!</h2>
        </div>
        <hr />
        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="lg" isLoading={loading}>
          Zaloguj
        </Button>
          {error && <p>{error}</p>}
        </form>
        <div className="auth-external-services">
          <p>Lub</p>
          <Button
          variant="secondary"
          size="lg"
          onClick={signInWithGoogle}
        >
          <FaGoogle className="auth-google-icon"/> Zaloguj przez Google
        </Button>
        </div>
        <div>
          Nie masz konta? <Link to="/register">Zarejestruj się</Link>
        </div>
      </div>
    </UserAuthWrapper>
  );
};

export default Login;
