import Stripe from "stripe";
import { env } from "./env";

function createStripeClient(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY not set — Stripe features disabled");
    return null;
  }

  return new Stripe(env.STRIPE_SECRET_KEY);
}

export const stripe = createStripeClient();
