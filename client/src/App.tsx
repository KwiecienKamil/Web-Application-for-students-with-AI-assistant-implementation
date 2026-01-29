import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import type { RootState } from "./store";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Register from "./pages/Register/Register";
import AuthCallback from "./features/auth/authCallback";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";
import "./index.css";
import Checkout from "./pages/Checkout/Checkout";
import PaymentSuccess from "./features/billing/components/PaymentSuccess";

function App() {
  useSupabaseAuth();
  const navigate = useNavigate();
  const session = useSelector((state: RootState) => state.auth.session);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home session={session} />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/register"
          element={session ? <Navigate to="/" /> : <Register />}
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/platnosc" element={<Checkout />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </>
  );
}

export default App;
