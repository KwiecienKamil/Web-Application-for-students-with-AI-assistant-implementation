import {
	PaymentElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import "./checkout-form.css";
import { Button } from "../../../../components/Button/Button";
import { Link } from "react-router-dom";

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
			<h2 className="checkout-title">Premium</h2>
			<p className="checkout-price">39.99 PLN</p>

			<div className="payment-wrapper">
				<PaymentElement />
			</div>
			<div className="checkout-form-actions">
				<Button variant="primary" size="lg" disabled={!stripe}>
					Zapłać
				</Button>
				<Link to="/" className="btn btn--delete btn--lg">
					Powrót
				</Link>
			</div>
		</form>
	);
};

export default CheckoutForm;
