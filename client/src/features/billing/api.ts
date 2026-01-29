import api from "../../services/api/client";

export const createPaymentIntent = (userId: string) => {
  return api.post("/create-payment-intent", {
    userId,
  });
};
