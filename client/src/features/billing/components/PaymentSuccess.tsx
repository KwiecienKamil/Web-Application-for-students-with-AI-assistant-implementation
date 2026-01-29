import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface PaymentSuccessParams {
  payment_intent: string | null;
  payment_intent_client_secret: string | null;
  redirect_status: string | null;
}

const useQueryParams = (): PaymentSuccessParams => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);

  return {
    payment_intent: query.get("payment_intent"),
    payment_intent_client_secret: query.get("payment_intent_client_secret"),
    redirect_status: query.get("redirect_status"),
  };
};

const PaymentSuccess: React.FC = () => {
  const { payment_intent, redirect_status } = useQueryParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!payment_intent || !redirect_status) {
      navigate("/", { replace: true });
    }
  }, [payment_intent, redirect_status, navigate]);

  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Płatność zakończona sukcesem 🎉</h1>

      <p>
        <strong>ID płatności:</strong> {payment_intent}
      </p>
      <p>
        <strong>Status:</strong> {redirect_status}
      </p>

      <p>Dziękujemy za skorzystanie z naszego serwisu!</p>
    </main>
  );
};

export default PaymentSuccess;
