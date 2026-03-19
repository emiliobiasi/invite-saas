# Stripe Integration

## Overview

InviteFlow uses Stripe Hosted Checkout for one-time payments. Organizers pay for premium event features through a Stripe-hosted payment page, which handles all payment UI, validation, and PCI compliance.

This integration can be migrated to Embedded Checkout in the future by changing the `ui_mode` parameter — the backend API stays the same.

## Architecture

```
src/
├── config/
│   └── stripe.ts          # Stripe SDK client (singleton, nullable)
└── modules/
    └── stripe/
        ├── stripe.routes.ts              # API endpoints
        └── __tests__/
            └── stripe.routes.test.ts     # Integration tests
```

The Stripe client follows the same optional pattern as Google OAuth: if `STRIPE_SECRET_KEY` is not set, the client is `null` and the server boots normally with Stripe features disabled.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `STRIPE_SECRET_KEY` | No* | Backend API key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_PUBLISHABLE_KEY` | No* | Frontend key (`pk_test_...` or `pk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | No* | Webhook signature verification (`whsec_...`) |

*Optional for server boot — required for Stripe features to work.

Get your keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys).

## API Endpoints

### `GET /api/stripe/status`

Returns whether Stripe is configured and the publishable key for frontend use.

**Response:**
```json
{
  "enabled": true,
  "publishableKey": "pk_test_..."
}
```

### `POST /api/stripe/checkout`

Creates a Stripe Hosted Checkout session and returns the redirect URL.

**Request body:**
```json
{
  "priceId": "price_...",
  "successUrl": "http://localhost:3000/success",
  "cancelUrl": "http://localhost:3000/cancel"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

**Errors:**
- `503` — Stripe not configured (missing `STRIPE_SECRET_KEY`)
- `422` — Invalid request body

## Setup Steps

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Copy your test API keys from the [Dashboard](https://dashboard.stripe.com/apikeys)
3. Add keys to `packages/be/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Create a Product and Price in the Stripe Dashboard (or via API)
5. Use the `priceId` when calling `POST /api/stripe/checkout`

## Testing

Run integration tests:

```bash
bun test
```

Tests verify:
- `/api/stripe/status` returns connection status
- `/api/stripe/checkout` returns 503 when Stripe is unconfigured
- `/api/stripe/checkout` validates request body (422 on invalid input)

## Future Enhancements

- **Webhooks**: Add `POST /api/stripe/webhook` to handle payment confirmations
- **Embedded Checkout**: Migrate from Hosted to Embedded when frontend is ready
- **Products API**: Create/manage products and prices via API instead of Dashboard
- **Customer portal**: Let organizers manage their payment history
