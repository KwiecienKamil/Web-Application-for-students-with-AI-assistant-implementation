import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Premium – 39.99 PLN</h2>
      <PaymentElement />
      <button>Zapłać</button>
    </form>
  );
};

export default CheckoutForm;
