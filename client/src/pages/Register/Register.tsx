import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { registerWithEmail } from "../../features/auth/authSlice";
import { Link } from "react-router-dom";
import UserAuthWrapper from "../../components/UserAuthWrapper/UserAuthWrapper";
import { Button } from "../../components/Button/Button";
import logo from "../../assets/logo-ot.png"
import supabase from "../../utils/supabase";
import { FaGoogle } from "react-icons/fa";

const Register = () => {
  const dispatch = useAppDispatch();
  const { loading, error, registrationSuccess } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerWithEmail({ email: email.trim(), password }));
  };

  if (registrationSuccess) {
    return (
      <div style={{ maxWidth: 420, margin: "40px auto", textAlign: "center" }}>
        <h2>Potwierdź email</h2>
        <p>
          Wysłaliśmy link aktywacyjny na <b>{email}</b>.
          <br />
          Kliknij w link, aby dokończyć rejestrację.
        </p>
        <Link to="/login">Wróć do logowania</Link>
      </div>
    );
  }

   const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) alert("Błąd logowania: " + error.message);
  };

  return (
    <UserAuthWrapper>
      <div className="auth-form">
       <div className="auth-title">
        <img src={logo} alt="Ogarnijto.org" />
        <h2>Witamy!</h2>
        </div>
        <form onSubmit={handleRegister}>
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

          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? "Rejestracja..." : "Zarejestruj się"}
          </Button>
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
              Masz już konto? <Link to="/login">Zaloguj się</Link>
            </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </UserAuthWrapper>
  );
};

export default Register;
