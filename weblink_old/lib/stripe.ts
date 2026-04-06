import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripeInstance: Promise<Stripe | null> | null = null;

/** Singleton: returns the same Stripe.js promise on every call. */
export function getStripe(): Promise<Stripe | null> {
  if (!stripeInstance) {
    stripeInstance = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
    );
  }
  return stripeInstance;
}
