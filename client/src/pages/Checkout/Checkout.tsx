import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { Elements } from "@stripe/react-stripe-js";
import { useStripe } from "../../features/billing/hooks/useStripe";
import { createPaymentIntent } from "../../features/billing/api";
import CheckoutForm from "../../features/billing/components/CheckoutForm";
import { Navigate } from "react-router-dom";

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
  if (!stripePromise) return <p>Ładowanie Stripe…</p>;
  if (!clientSecret) return <p>Ładowanie płatności…</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
