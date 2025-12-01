import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("No se ha definido el Stripe secret key");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});
