import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import UserAuthWrapper from "../../components/UserAuthWrapper/UserAuthWrapper";
import { createPaymentIntent } from "../../features/billing/api";
import CheckoutForm from "../../features/billing/components/CheckoutForm/CheckoutForm";
import { useStripe } from "../../features/billing/hooks/useStripe";
import { useAppSelector } from "../../store/hooks";
import "../Login/login.css";
import { stripeAppearance } from "../../utils/Helpers";

const Checkout = () => {
  const session = useAppSelector((state) => state.auth.session);
  const userId = session?.user?.id;
  const stripePromise = useStripe();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    createPaymentIntent(userId).then((res) => {
      setClientSecret(res.data.clientSecret);
    });
  }, [userId]);

  if (!session) return <Navigate to="/login" />;

  if (!stripePromise || !clientSecret) {
    return (
      <UserAuthWrapper>
        <div className="auth-form">
          <p>Ładowanie płatności…</p>
        </div>
      </UserAuthWrapper>
    );
  }

  return (
    <UserAuthWrapper>
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance: stripeAppearance }}
      >
        <CheckoutForm />
      </Elements>
    </UserAuthWrapper>
  );
};

export default Checkout;
