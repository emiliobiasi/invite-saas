import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { errorHandler } from "../../../lib/error-handler";
import { stripeRoutes } from "../stripe.routes";

const app = new Elysia().use(errorHandler).use(stripeRoutes);

describe("Stripe routes", () => {
  test("GET /api/stripe/status returns Stripe connection status", async () => {
    const response = await app.handle(new Request("http://localhost/api/stripe/status"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty("enabled");
    expect(body).toHaveProperty("publishableKey");
    expect(typeof body.enabled).toBe("boolean");
  });

  test("POST /api/stripe/checkout returns 503 when Stripe is not configured", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: "price_test_123",
          successUrl: "http://localhost:3000/success",
          cancelUrl: "http://localhost:3000/cancel",
        }),
      }),
    );

    // Without STRIPE_SECRET_KEY set, stripe client is null → 503
    if (response.status === 503) {
      const body = await response.json();
      expect(body.error).toBe("Stripe is not configured");
    } else {
      // If keys are configured, we get a Stripe API error for the fake priceId
      expect(response.status).not.toBe(200);
    }
  });

  test("POST /api/stripe/checkout validates request body", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(422);
  });
});
