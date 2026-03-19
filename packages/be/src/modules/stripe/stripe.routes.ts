import { Elysia, t } from "elysia";
import { stripe } from "../../config/stripe";
import { AppError } from "../../lib/error-handler";
import { env } from "../../config/env";

export const stripeRoutes = new Elysia({ prefix: "/api/stripe" })
  .get("/status", () => {
    return {
      enabled: stripe !== null,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY ?? null,
    };
  })
  .post(
    "/checkout",
    async ({ body }) => {
      if (!stripe) {
        throw new AppError(503, "Stripe is not configured");
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price: body.priceId,
            quantity: 1,
          },
        ],
        success_url: body.successUrl,
        cancel_url: body.cancelUrl,
      });

      return { url: session.url };
    },
    {
      body: t.Object({
        priceId: t.String(),
        successUrl: t.String(),
        cancelUrl: t.String(),
      }),
    },
  );
