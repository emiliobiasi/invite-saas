# Domain Model — InviteFlow BE

> Canonical entity definitions and relationships for the backend.

---

## Entity Relationship Diagram

```
User (organizer)
 └── Event (1:N)
      ├── InviteTemplate (1:1)      — visual customization + quote (required)
      ├── EventSettings (1:1)       — component visibility toggles
      ├── EventPurchase (1:1)       — payment record (Stripe checkout)
      ├── EventFeatures (1:1)       — purchased add-on features
      ├── EventPhoto (1:N)          — photo carousel, max 10 (requires photos add-on)
      ├── EventLink (1:N)           — custom links, max 10 (included in base)
      ├── EventVideo (1:N)          — YouTube embeds, max 10 (included in base)
      ├── EventUploadedVideo (1:N)  — direct video uploads, max 1 (requires video add-on)
      ├── EventMusic (1:N)          — Spotify embeds, max 5 (included in base)
      └── RSVP (1:N)               — guest responses (toggle via EventSettings)
```

### Component visibility model

Components fall into two categories:

**Presence-based (no toggle needed):** Photos, Links, YouTube Videos, Uploaded Videos, Music,
Quote (in template) — if records/content exist, the section renders on the public page.
If none exist, the section is hidden. The CRUD lifecycle IS the config.

**Toggle-based (controlled by EventSettings):** RSVP, Weather, Map — these are either enabled
or disabled by the organizer, independent of whether data exists.

---

## Entities

### User

Managed by Better Auth. No custom fields beyond what Better Auth provides.

| Field         | Type     | Constraints              |
|---------------|----------|--------------------------|
| id            | uuid     | PK                       |
| name          | string   | required                 |
| email         | string   | required, unique         |
| emailVerified | boolean  | default false            |
| image         | string?  | avatar URL               |
| createdAt     | datetime | auto                     |
| updatedAt     | datetime | auto                     |

**Public page exposure:**
- The public invite page shows a "Hosted by" section with the organizer's `name` and `image`
- Only `name` and `image` are exposed — `email`, `id`, and other fields are never public

---

### Event

The core entity. Represents a single event created by an organizer.

| Field              | Type      | Constraints                          |
|--------------------|-----------|--------------------------------------|
| id                 | uuid      | PK                                   |
| userId             | uuid      | FK → User, required                  |
| title              | string    | required, max 120 chars              |
| description        | string?   | max 2000 chars                       |
| date               | datetime  | required                             |
| location           | string    | required, max 300 chars              |
| slug               | string    | unique, auto-generated from title    |
| status             | enum      | DRAFT / ACTIVE / FINISHED / ARCHIVED |
| planDuration       | enum?     | 1_MONTH / 3_MONTHS / 6_MONTHS       |
| publishedAt        | datetime? | set when DRAFT → ACTIVE, immutable   |
| expiresAt          | datetime? | publishedAt + planDuration, immutable|
| postEventExpiresAt | datetime? | set when FINISHED, based on plan     |
| createdAt          | datetime  | auto                                 |
| updatedAt          | datetime  | auto                                 |

**Status lifecycle:**

```
DRAFT → ACTIVE → FINISHED → ARCHIVED
                    │                ↑
                    └────────────────┘ (auto on expiration)
```

- `DRAFT`: event is being configured, public page returns 404
- `ACTIVE`: public page is live, RSVPs are accepted. Requires completed payment to enter this status.
- `FINISHED`: organizer marked as ended, public page visible but RSVPs blocked
- `ARCHIVED`: invite expired (auto-transition when `expiresAt` or `postEventExpiresAt` is reached), public page returns 404

**Expiration rules:**
- `publishedAt` is set once when status transitions to ACTIVE (immutable)
- `expiresAt` = `publishedAt` + `planDuration` — the invite page goes offline after this date
- `postEventExpiresAt` is set when status transitions to FINISHED:
  - 1_MONTH plan → event.date + 7 days
  - 3_MONTHS plan → event.date + 30 days
  - 6_MONTHS plan → event.date + 60 days
- When either `expiresAt` or `postEventExpiresAt` is reached, status auto-transitions to ARCHIVED

**Slug generation:**
- Derived from title: lowercase, accents stripped, spaces to hyphens
- Append random suffix (6 chars) to guarantee uniqueness
- Example: `"Festa de Formatura"` → `festa-de-formatura-a3k9x2`

---

### InviteTemplate

Visual customization for the event's public page. One per event (1:1).

| Field          | Type    | Constraints                    |
|----------------|---------|--------------------------------|
| id             | uuid    | PK                             |
| eventId        | uuid    | FK → Event, unique (1:1)       |
| headline       | string? | max 200 chars                  |
| message        | string? | max 2000 chars                 |
| backgroundUrl  | string? | URL to background image        |
| primaryColor   | string  | hex color, default `"#E63946"` |
| secondaryColor | string  | hex color, default `"#1D3557"` |
| quoteText      | string? | max 500 chars                  |
| quoteAuthor    | string? | max 100 chars                  |
| createdAt      | datetime| auto                           |
| updatedAt      | datetime| auto                           |

**Quote component:**
- Renders as a styled citation block on the public page
- Visibility is presence-based: if `quoteText` has content, the block renders
- `quoteAuthor` is optional — the quote can appear without attribution

---

### EventPhoto

Photos for the event carousel/mini album.

| Field    | Type     | Constraints                 |
|----------|----------|-----------------------------|
| id       | uuid     | PK                          |
| eventId  | uuid     | FK → Event, required        |
| url      | string   | required, stored file URL   |
| order    | integer  | display order, default 0    |
| createdAt| datetime | auto                        |

**Constraints:**
- Max 10 photos per event
- Organizer uploads the file; backend stores and returns the URL
- **Requires photos add-on** — upload is blocked if `EventFeatures.photosEnabled` is `false`

---

### EventLink

Custom links the organizer wants to share on the invite page.

| Field    | Type     | Constraints              |
|----------|----------|--------------------------|
| id       | uuid     | PK                       |
| eventId  | uuid     | FK → Event, required     |
| label    | string   | required, max 100 chars  |
| url      | string   | required, valid URL       |
| order    | integer  | display order, default 0 |
| createdAt| datetime | auto                     |

**Constraints:**
- Max 10 links per event

---

### EventVideo

YouTube video embeds for the invite page.

| Field    | Type     | Constraints              |
|----------|----------|--------------------------|
| id       | uuid     | PK                       |
| eventId  | uuid     | FK → Event, required     |
| url      | string   | required, valid YouTube URL |
| title    | string?  | max 200 chars            |
| order    | integer  | display order, default 0 |
| createdAt| datetime | auto                     |

**Constraints:**
- Max 10 videos per event
- URL must be a valid YouTube URL (youtube.com or youtu.be)

---

### EventUploadedVideo

Direct video uploads by the organizer (not YouTube embeds).

| Field    | Type     | Constraints                 |
|----------|----------|-----------------------------|
| id       | uuid     | PK                          |
| eventId  | uuid     | FK → Event, required        |
| url      | string   | required, stored file URL   |
| title    | string?  | max 200 chars               |
| order    | integer  | display order, default 0    |
| createdAt| datetime | auto                        |

**Constraints:**
- Max 1 uploaded video per event
- Max file size: 50 MB
- Accepted formats: MP4, WebM
- Organizer uploads the file; backend stores and returns the URL
- **Requires video add-on** — upload is blocked if `EventFeatures.videoEnabled` is `false`

---

### EventMusic

Spotify embeds for the invite page (tracks, albums, or playlists).

| Field      | Type     | Constraints                    |
|------------|----------|--------------------------------|
| id         | uuid     | PK                             |
| eventId    | uuid     | FK → Event, required           |
| spotifyUrl | string   | required, valid Spotify URL    |
| title      | string?  | max 200 chars                  |
| order      | integer  | display order, default 0       |
| createdAt  | datetime | auto                           |

**Constraints:**
- Max 5 music embeds per event
- URL must be a valid Spotify URL (open.spotify.com)

---

### EventSettings

Display configuration for the event's public page. Controls which optional components are visible.
One per event (1:1). Created automatically when an event is created.

| Field       | Type    | Constraints                     |
|-------------|---------|---------------------------------|
| id          | uuid    | PK                              |
| eventId     | uuid    | FK → Event, unique (1:1)        |
| showRsvp    | boolean | default `true`                  |
| showWeather | boolean | default `false`                 |
| showMap     | boolean | default `false`                 |
| createdAt   | datetime| auto                            |
| updatedAt   | datetime| auto                            |

**Notes:**
- Photos, Links, YouTube Videos, Uploaded Videos, Music, and Quote do NOT have toggles — their visibility is presence-based
- `showWeather`: when enabled, the public page fetches and displays a weather forecast
  for the event's date, time, and location via an external weather API (real-time).
  **Requires weather add-on** — toggle is rejected if `EventFeatures.weatherEnabled` is `false`.
- `showMap`: when enabled, the public page renders an interactive mini map with a pin
  on the event location. Clickable to open in Google Maps or Waze.
  **Requires map add-on** — toggle is rejected if `EventFeatures.mapEnabled` is `false`.

---

### EventPurchase

Payment record linking an event to a Stripe checkout session. One per event (1:1).
Created when the organizer completes payment to publish the event.

| Field                | Type     | Constraints                                 |
|----------------------|----------|---------------------------------------------|
| id                   | uuid     | PK                                          |
| eventId              | uuid     | FK → Event, unique (1:1)                    |
| userId               | uuid     | FK → User, required                         |
| stripeSessionId      | string   | Stripe Checkout Session ID                  |
| stripePaymentIntentId| string?  | Stripe PaymentIntent ID (set via webhook)   |
| basePlan             | enum     | 1_MONTH / 3_MONTHS / 6_MONTHS              |
| addons               | string[] | e.g. `["photos", "video", "weather", "map"]`|
| totalAmount          | integer  | total in cents (BRL)                        |
| currency             | string   | default `"brl"`                             |
| status               | enum     | PENDING / COMPLETED / REFUNDED              |
| createdAt            | datetime | auto                                        |
| updatedAt            | datetime | auto                                        |

**Notes:**
- Created with status `PENDING` when Stripe checkout session is initiated
- Transitions to `COMPLETED` when Stripe webhook confirms payment
- The event only transitions to ACTIVE after purchase status is `COMPLETED`
- `addons` stores the list of purchased add-on keys for auditing

---

### EventFeatures

Tracks which paid features are enabled for this event. One per event (1:1).
Created alongside EventPurchase after successful payment.

| Field          | Type    | Constraints                           |
|----------------|---------|---------------------------------------|
| id             | uuid    | PK                                    |
| eventId        | uuid    | FK → Event, unique (1:1)              |
| photosEnabled  | boolean | default `false`, unlocks photo uploads|
| photosLimit    | integer | `0` or `10`                           |
| videoEnabled   | boolean | default `false`, unlocks video upload |
| videoLimit     | integer | `0` or `1`                            |
| weatherEnabled | boolean | default `false`, unlocks weather toggle|
| mapEnabled     | boolean | default `false`, unlocks map toggle   |
| createdAt      | datetime| auto                                  |

**Notes:**
- Feature flags gate access to paid components at the API level
- Attempting to upload photos without `photosEnabled = true` returns `403`
- Attempting to upload video without `videoEnabled = true` returns `403`
- Attempting to enable `showWeather` without `weatherEnabled = true` returns `403`
- Attempting to enable `showMap` without `mapEnabled = true` returns `403`

---

### RSVP

Guest response to an event invitation. No authentication required.

| Field       | Type     | Constraints                            |
|-------------|----------|----------------------------------------|
| id          | uuid     | PK                                     |
| eventId     | uuid     | FK → Event, required                   |
| status      | enum     | GOING / NOT_GOING / MAYBE              |
| guestName   | string?  | optional, max 100 chars                |
| guestEmail  | string?  | optional, valid email format            |
| respondedAt | datetime | auto                                   |

**Constraints:**
- No authentication required to RSVP
- Both `guestName` and `guestEmail` are optional — zero-friction is the default
- One RSVP per submission (no deduplication in MVP — each submission is a new record)
- RSVP buttons only appear on the public page when `EventSettings.showRsvp` is `true`
