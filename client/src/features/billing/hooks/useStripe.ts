import type { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

export const useStripe = (): Stripe | null => {
	const [stripe, setStripe] = useState<Stripe | null>(null);

	useEffect(() => {
		fetch(`${import.meta.env.VITE_SERVER_URL}/config`)
			.then((res) => res.json())
			.then((data) => {
				loadStripe(data.publishableKey).then((stripeInstance) => {
					setStripe(stripeInstance);
				});
			})
			.catch((err) => console.error("Błąd pobierania publishableKey:", err));
	}, []);

	return stripe;
};
