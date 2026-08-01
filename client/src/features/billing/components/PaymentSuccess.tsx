import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserAuthWrapper from "../../../components/UserAuthWrapper/UserAuthWrapper";
import "../../../components/Button/button.css";
import { fetchUser } from "../../auth/userSlice";
import { confirmPayment } from "../api";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import "./CheckoutForm/checkout-form.css";
import "./payment-success.css";

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

const PaymentSuccess = () => {
	const { payment_intent, redirect_status } = useQueryParams();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const session = useAppSelector((state) => state.auth.session);

	useEffect(() => {
		if (!payment_intent || redirect_status !== "succeeded") {
			navigate("/", { replace: true });
			return;
		}

		if (!session?.access_token) return;

		confirmPayment(payment_intent, session.access_token)
			.then(() => dispatch(fetchUser()))
			.catch((err) => console.error("confirm-payment failed:", err));
	}, [payment_intent, redirect_status, session, navigate, dispatch]);

	return (
		<UserAuthWrapper>
			<div className="checkout-form">
				<div className="checkout-header">
					<h2 className="checkout-title">
						Konto <span>Premium</span> aktywne
					</h2>
					<p className="payment-success-message">
						Płatność zakończona sukcesem
					</p>
					<p className="checkout-subtitle">
						Dziękujemy za zakup! Możesz teraz korzystać ze wszystkich funkcji
						Premium w aplikacji.
					</p>
				</div>

				<div className="checkout-form-actions">
					<Link to="/" className="btn btn--primary btn--lg">
						Wróć do aplikacji
					</Link>
				</div>
			</div>
		</UserAuthWrapper>
	);
};

export default PaymentSuccess;
