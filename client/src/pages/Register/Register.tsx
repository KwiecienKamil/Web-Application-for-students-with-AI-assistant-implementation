import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { registerWithEmail } from "../../features/auth/authSlice";
import { Link } from "react-router-dom";
import UserAuthWrapper from "../../components/UserAuthWrapper/UserAuthWrapper";

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

  return (
    <UserAuthWrapper>
      <div className="auth-form">
        <h2>Rejestracja</h2>
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

          <button type="submit" disabled={loading}>
            {loading ? "Rejestracja..." : "Zarejestruj się"}
          </button>
          <Link to="/login">Masz już konto?</Link>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </div>
    </UserAuthWrapper>
  );
};

export default Register;
