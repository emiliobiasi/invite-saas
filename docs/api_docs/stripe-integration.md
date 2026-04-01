# Stripe Integration

## Overview

InviteFlow uses Stripe Hosted Checkout for one-time payments. Every invite is paid — the price is composed of a **base plan** (duration the invite stays active) plus optional **paid add-ons** (photos, video, weather, map). Organizers pay through a Stripe-hosted payment page, which handles all payment UI, validation, and PCI compliance.

This integration can be migrated to Embedded Checkout in the future by changing the `ui_mode` parameter — the backend API stays the same.

## Pricing Model

### Base Plan (required — one per invite)

The base plan determines how long the invite stays active after publishing.

| Plan | Duration | Post-event visibility | Stripe Product Key |
|------|----------|----------------------|-------------------|
| 1_MONTH | 30 days | 7 days after FINISHED | `invite_base_1m` |
| 3_MONTHS | 90 days | 30 days after FINISHED | `invite_base_3m` |
| 6_MONTHS | 180 days | 60 days after FINISHED | `invite_base_6m` |

What's included in every base plan (no add-on required):

- Title, date, location, description
- Headline, message, quote
- Custom links (up to 10)
- YouTube embeds (up to 10)
- Spotify embeds (up to 5)
- RSVP buttons + counter
- Background image (1 upload)
- "Hosted by" section (organizer name + avatar)

### Add-ons (optional — purchased alongside the base plan)

| Add-on | What it unlocks | Stripe Product Key |
|--------|----------------|-------------------|
| Photos | Photo carousel (up to 10 photos, 5 MB each) | `addon_photos` |
| Video | Direct video upload (1 video, 50 MB max) | `addon_video` |
| Weather | Weather forecast widget | `addon_weather` |
| Map | Interactive mini map | `addon_map` |

### Price Calculation

```
Total = base plan price + sum of selected add-on prices
```

Example:
```
Convite de casamento:
  Base (3 meses)    = R$ X
  + Fotos           = R$ Y
  + Video           = R$ Z
  + Map             = R$ W
  ─────────────────────
  Total             = R$ X+Y+Z+W  (one-time payment)
```

> Actual prices are configured as Stripe Price objects in the Stripe Dashboard. The backend resolves `planDuration` + `addons` to the corresponding Stripe Price IDs.

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

### `POST /api/stripe/create-checkout`

Creates a Stripe Hosted Checkout session with the base plan and selected add-ons as line items.

**Auth:** Required (organizer must own the event).

**Request body:**
```json
{
  "eventId": "uuid",
  "planDuration": "3_MONTHS",
  "addons": {
    "photos": true,
    "video": false,
    "weather": true,
    "map": false
  },
  "successUrl": "http://localhost:3000/events/{eventId}/success",
  "cancelUrl": "http://localhost:3000/events/{eventId}/cancel"
}
```

**What happens on the backend:**
1. Validates the request and event ownership
2. Resolves `planDuration` → Stripe Price ID for base plan
3. Resolves each `true` addon → Stripe Price ID
4. Creates Stripe Checkout Session with multiple line items
5. Creates `EventPurchase` record with status `PENDING`
6. Returns the Stripe redirect URL

**Stripe Checkout Session creation (conceptual):**
```json
{
  "mode": "payment",
  "line_items": [
    { "price": "price_base_3m_xxx", "quantity": 1 },
    { "price": "price_addon_photos_xxx", "quantity": 1 },
    { "price": "price_addon_weather_xxx", "quantity": 1 }
  ],
  "metadata": {
    "eventId": "uuid",
    "planDuration": "3_MONTHS",
    "addons": "photos,weather"
  },
  "success_url": "http://localhost:3000/events/{eventId}/success",
  "cancel_url": "http://localhost:3000/events/{eventId}/cancel"
}
```

**Response `200`:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/...",
  "sessionId": "cs_test_..."
}
```

**Errors:**
- `400` — Event is not in DRAFT status, or already has a completed purchase
- `403` — Event does not belong to authenticated user
- `422` — Invalid request body
- `503` — Stripe not configured (missing `STRIPE_SECRET_KEY`)

### `POST /api/stripe/webhook`

Handles Stripe webhook events. Verifies the Stripe signature before processing.

**Auth:** None (Stripe sends directly). Verified via `STRIPE_WEBHOOK_SECRET`.

**Events handled:**

| Stripe Event | Action |
|---|---|
| `checkout.session.completed` | Update `EventPurchase.status` → `COMPLETED`, set `stripePaymentIntentId`, create `EventFeatures` record based on purchased add-ons |
| `charge.refunded` | Update `EventPurchase.status` → `REFUNDED` (future) |

**After `checkout.session.completed`:**
1. Find `EventPurchase` by `stripeSessionId`
2. Update status to `COMPLETED`
3. Set `stripePaymentIntentId` from the event data
4. Create `EventFeatures` record reflecting the purchased add-ons (from session metadata)
5. Set `Event.planDuration` from session metadata
6. The event is now ready to be published (DRAFT → ACTIVE)

**Response:** `200` on success, `400` on signature verification failure.

**Idempotency:** Webhook handler must handle duplicate deliveries gracefully — if `EventPurchase` is already `COMPLETED`, return `200` without re-processing.

### `GET /api/events/:id/purchase`

Returns the purchase details for an event.

**Auth:** Required (owner only).

**Response `200`:**
```json
{
  "id": "uuid",
  "basePlan": "3_MONTHS",
  "addons": ["photos", "weather"],
  "totalAmount": 4990,
  "currency": "brl",
  "status": "COMPLETED",
  "createdAt": "2026-03-19T10:00:00Z"
}
```

**Errors:**
- `404` — No purchase exists for this event
- `403` — Not the event owner

### `GET /api/events/:id/features`

Returns the purchased features for an event.

**Auth:** Required (owner only).

**Response `200`:**
```json
{
  "photosEnabled": true,
  "photosLimit": 10,
  "videoEnabled": false,
  "videoLimit": 0,
  "weatherEnabled": true,
  "mapEnabled": false
}
```

**Errors:**
- `404` — No features exist for this event (no purchase completed)
- `403` — Not the event owner

## Checkout Flow (end-to-end)

```
1. Organizer creates event (DRAFT)
2. Organizer customizes invite (template, links, YouTube, Spotify, etc.)
3. Organizer clicks "Publish" → frontend shows plan selection + add-ons
4. Organizer selects plan (1/3/6 months) + add-ons (photos, video, weather, map)
5. Frontend calls POST /api/stripe/create-checkout
6. Backend creates EventPurchase (PENDING) + Stripe Checkout Session
7. Frontend redirects to Stripe Checkout URL
8. Organizer completes payment on Stripe
9. Stripe sends webhook → backend updates EventPurchase (COMPLETED) + creates EventFeatures
10. Organizer returns to success URL
11. Frontend calls PATCH /api/events/:id/publish → event goes ACTIVE
12. Invite page is live
```

## Stripe Dashboard Setup

### Products to create

| Product | Type | Key | Notes |
|---------|------|-----|-------|
| Invite Base 1 Month | One-time | `invite_base_1m` | Price in BRL |
| Invite Base 3 Months | One-time | `invite_base_3m` | Price in BRL |
| Invite Base 6 Months | One-time | `invite_base_6m` | Price in BRL |
| Add-on: Photos | One-time | `addon_photos` | Price in BRL |
| Add-on: Video | One-time | `addon_video` | Price in BRL |
| Add-on: Weather | One-time | `addon_weather` | Price in BRL |
| Add-on: Map | One-time | `addon_map` | Price in BRL |

### Environment setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create the products and prices listed above in the Dashboard
3. Copy your test API keys from the [Dashboard](https://dashboard.stripe.com/apikeys)
4. Add keys to `packages/be/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. Configure the webhook endpoint in Stripe Dashboard pointing to `POST /api/stripe/webhook`
6. Select events to listen for: `checkout.session.completed`

## Testing

Run integration tests:

```bash
bun test
```

Tests verify:
- `/api/stripe/status` returns connection status
- `/api/stripe/create-checkout` validates request body and event ownership
- `/api/stripe/create-checkout` returns 503 when Stripe is unconfigured
- `/api/stripe/create-checkout` returns 400 for non-DRAFT events
- `/api/stripe/webhook` processes payment confirmation correctly
- `/api/stripe/webhook` verifies Stripe signature
- `/api/stripe/webhook` handles duplicate deliveries idempotently
- Feature gating works after purchase (photos, video, weather, map)

## Future Enhancements

- **Embedded Checkout**: Migrate from Hosted to Embedded when frontend is ready
- **Products API**: Create/manage products and prices via API instead of Dashboard
- **Customer portal**: Let organizers manage their payment history
- **Time extensions**: Allow purchasing additional time for an active invite
- **Refunds**: Implement refund flow via Stripe
