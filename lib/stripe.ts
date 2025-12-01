import Stripe from "stripe";

// Stripe es opcional - solo se inicializa si está configurado
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
      typescript: true,
    })
  : null;
