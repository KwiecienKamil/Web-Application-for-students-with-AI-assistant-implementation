import api from "../../services/api/client";

export const createPaymentIntent = (userId: string) => {
	return api.post("/create-payment-intent", {
		userId,
	});
};

export const confirmPayment = (paymentIntentId: string, accessToken: string) => {
	return api.post(
		"/confirm-payment",
		{ paymentIntentId },
		{ headers: { Authorization: `Bearer ${accessToken}` } },
	);
};
