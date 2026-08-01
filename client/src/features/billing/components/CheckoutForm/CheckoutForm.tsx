import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/Button/Button";
import "../../../../components/Button/button.css";
import "./checkout-form.css";

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
    <form className="checkout-form" onSubmit={handleSubmit}>
      <div className="checkout-header">
        <h2 className="checkout-title">
          Konto <span>Premium</span>
        </h2>
        <p className="checkout-price">39,99 PLN</p>
      </div>

      <div className="form-group">
        <label htmlFor="payment-element">Dane płatności</label>
        <div className="payment-wrapper">
          <PaymentElement id="payment-element" />
        </div>
      </div>

      <div className="checkout-form-actions">
        <Button variant="primary" size="lg" disabled={!stripe}>
          Zapłać
        </Button>
        <Link to="/" className="btn btn--secondary btn--lg">
          Powrót
        </Link>
      </div>
    </form>
  );
};

export default CheckoutForm;
