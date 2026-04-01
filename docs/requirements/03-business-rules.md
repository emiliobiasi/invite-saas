# Business Rules — InviteFlow BE

> Rules that govern system behavior beyond simple CRUD.

---

## 1. Ownership & Authorization

| Rule | Description |
|------|-------------|
| BR-AUTH-01 | Only authenticated users (organizers) can create, edit, and manage events |
| BR-AUTH-02 | An organizer can only access events where `event.userId` matches their session user ID |
| BR-AUTH-03 | Any attempt to access another organizer's event returns `403 Forbidden` |
| BR-AUTH-04 | Public endpoints (`/api/public/*`) require no authentication |

---

## 2. Event Lifecycle

| Rule | Description |
|------|-------------|
| BR-EVT-01 | New events are always created with `status: DRAFT` |
| BR-EVT-02 | Status transitions: `DRAFT → ACTIVE → FINISHED → ARCHIVED`. Also `ACTIVE → ARCHIVED` (on expiration). No backwards transitions, no skipping. |
| BR-EVT-03 | An event can only be published (`DRAFT → ACTIVE`) if it has at minimum: `title`, `date`, `location` |
| BR-EVT-04 | Event fields can only be edited when status is `DRAFT` or `ACTIVE` (not `FINISHED` or `ARCHIVED`) |
| BR-EVT-05 | An event can only be deleted when status is `DRAFT` |
| BR-EVT-06 | Deleting an event cascades to: settings, template, features, purchase, photos, links, videos, uploaded videos, music, RSVPs |
| BR-EVT-07 | Slug is auto-generated from title + random suffix, immutable after creation |
| BR-EVT-08 | Creating an event auto-creates an `EventSettings` record with default values |
| BR-EVT-09 | An event can only be published (`DRAFT → ACTIVE`) after a completed payment via Stripe (`EventPurchase.status = COMPLETED`) |
| BR-EVT-10 | `publishedAt` is set once when status transitions to ACTIVE — immutable after that |
| BR-EVT-11 | `expiresAt` = `publishedAt` + `planDuration` — immutable after publish |
| BR-EVT-12 | `postEventExpiresAt` is set when status transitions to FINISHED (1_MONTH: date+7d, 3_MONTHS: date+30d, 6_MONTHS: date+60d) |
| BR-EVT-13 | When `expiresAt` or `postEventExpiresAt` is reached, status auto-transitions to `ARCHIVED` |
| BR-EVT-14 | `ARCHIVED` events cannot be edited, deleted, or have content added |
| BR-EVT-15 | Deleting an ARCHIVED event's storage files happens after a 7-day grace period |

---

## 3. Public Page Visibility

| Rule | Description |
|------|-------------|
| BR-PUB-01 | `DRAFT` events return `404` on the public endpoint — they do not exist publicly |
| BR-PUB-02 | `ACTIVE` events return full invite data with `acceptingRsvp: true` |
| BR-PUB-03 | `FINISHED` events return full invite data with `acceptingRsvp: false` |
| BR-PUB-04 | Public endpoints never expose `event.id`, `event.userId`, or internal identifiers |
| BR-PUB-05 | Public page includes `host` object with organizer `name` and `image` only — never email or internal IDs |
| BR-PUB-06 | `ARCHIVED` events return `404` on the public endpoint — the invite has expired |
| BR-PUB-07 | If `expiresAt` is in the past, public endpoint returns `404` even if status hasn't been updated to ARCHIVED yet |

---

## 4. RSVP

| Rule | Description |
|------|-------------|
| BR-RSVP-01 | RSVPs are only accepted for `ACTIVE` events with `settings.showRsvp = true` |
| BR-RSVP-02 | RSVP to a `DRAFT` event returns `404` (event doesn't exist publicly) |
| BR-RSVP-03 | RSVP to a `FINISHED` event returns `400` with message indicating event is closed |
| BR-RSVP-04 | `status` field is required and must be one of: `GOING`, `NOT_GOING`, `MAYBE` |
| BR-RSVP-05 | `guestName` and `guestEmail` are optional — zero-friction is the default |
| BR-RSVP-06 | No deduplication in MVP — each submission creates a new record |
| BR-RSVP-07 | After RSVP, response includes updated counts by status |
| BR-RSVP-08 | RSVP to an event with `settings.showRsvp = false` returns `403` (RSVP disabled by organizer) |

---

## 5. Content Limits

| Rule | Description |
|------|-------------|
| BR-LIM-01 | Max 10 photos per event (requires photos add-on: `EventFeatures.photosEnabled = true`) |
| BR-LIM-02 | Max 10 links per event |
| BR-LIM-03 | Max 10 YouTube videos per event |
| BR-LIM-04 | Photo upload max file size: 5 MB |
| BR-LIM-05 | Photo accepted formats: JPEG, PNG, WebP |
| BR-LIM-06 | YouTube URL must match `youtube.com` or `youtu.be` domains |
| BR-LIM-07 | Max 1 uploaded video per event (requires video add-on: `EventFeatures.videoEnabled = true`) |
| BR-LIM-08 | Uploaded video max file size: 50 MB |
| BR-LIM-09 | Uploaded video accepted formats: MP4, WebM |
| BR-LIM-10 | Max 5 music embeds (Spotify) per event |
| BR-LIM-11 | Spotify URL must match `open.spotify.com` domain |
| BR-LIM-12 | Attempting to upload photos without purchased photos add-on returns `403 FEATURE_NOT_PURCHASED` |
| BR-LIM-13 | Attempting to upload video without purchased video add-on returns `403 FEATURE_NOT_PURCHASED` |

---

## 6. Template

| Rule | Description |
|------|-------------|
| BR-TPL-01 | One template per event (1:1 relationship) |
| BR-TPL-02 | Template uses upsert semantics — PUT creates if absent, updates if exists |
| BR-TPL-03 | Default colors are applied if not specified: `primaryColor: "#E63946"`, `secondaryColor: "#1D3557"` |
| BR-TPL-04 | Quote is presence-based: if `quoteText` has content, the quote block renders on the public page |
| BR-TPL-05 | `quoteAuthor` is optional — quote can appear without attribution |

---

## 7. Slug Generation

| Rule | Description |
|------|-------------|
| BR-SLUG-01 | Generated from title: lowercase, strip accents, replace spaces with hyphens |
| BR-SLUG-02 | Append 6-char random alphanumeric suffix for uniqueness |
| BR-SLUG-03 | Slug is immutable — changing the title does NOT regenerate the slug |
| BR-SLUG-04 | Slug must be unique across all events in the system |

---

## 8. Event Settings

| Rule | Description |
|------|-------------|
| BR-SET-01 | One settings record per event (1:1), auto-created with the event |
| BR-SET-02 | Default values: `showRsvp: true`, `showWeather: false`, `showMap: false` |
| BR-SET-03 | Photos, Links, YouTube Videos, Uploaded Videos, Music, and Quote have no toggle — visibility is presence-based (records/content exist = section renders) |
| BR-SET-04 | `showWeather`: frontend renders weather forecast widget for event date/time/location via external API. **Requires weather add-on** (`EventFeatures.weatherEnabled = true`) — attempting to enable without the add-on returns `403 FEATURE_NOT_PURCHASED` |
| BR-SET-05 | `showMap`: frontend renders interactive mini map with pin on event location, clickable to open Google Maps or Waze. **Requires map add-on** (`EventFeatures.mapEnabled = true`) — attempting to enable without the add-on returns `403 FEATURE_NOT_PURCHASED` |
| BR-SET-06 | `acceptingRsvp` on the public page is `false` if event is `FINISHED` OR if `showRsvp` is `false` |

---

## 9. Payments & Monetization

Every invite is paid. The price is composed of a base plan (duration) plus optional add-ons.

| Rule | Description |
|------|-------------|
| BR-PAY-01 | Events start in DRAFT with no plan selected. Organizer selects `planDuration` before publishing. |
| BR-PAY-02 | To publish (DRAFT → ACTIVE), organizer must complete a Stripe Checkout payment |
| BR-PAY-03 | Available plan durations: `1_MONTH` (30 days), `3_MONTHS` (90 days), `6_MONTHS` (180 days) |
| BR-PAY-04 | Available add-ons: `photos` (carousel up to 10), `video` (1 direct upload), `weather` (forecast widget), `map` (interactive map) |
| BR-PAY-05 | Stripe Checkout session is created with one line item for the base plan + one line item per selected add-on |
| BR-PAY-06 | `EventPurchase` is created with status `PENDING` when checkout session is initiated |
| BR-PAY-07 | `EventPurchase` transitions to `COMPLETED` when Stripe webhook confirms successful payment |
| BR-PAY-08 | `EventFeatures` is created after payment confirmation, reflecting the purchased add-ons |
| BR-PAY-09 | Event transitions to ACTIVE only after `EventPurchase.status = COMPLETED` |
| BR-PAY-10 | `planDuration` cannot be changed after the event is published |
| BR-PAY-11 | Purchased features cannot be downgraded or removed after payment |

### Included in base plan (all invites)

These components have no infrastructure cost and are always available:

- Title, date, location, description
- Headline, message, quote
- Custom links (up to 10)
- YouTube embeds (up to 10)
- Spotify embeds (up to 5)
- RSVP buttons + counter
- Background image (1 upload)
- "Hosted by" section (organizer name + avatar)

### Paid add-ons

| Add-on | What it unlocks | Limit |
|--------|----------------|-------|
| `photos` | Photo carousel | Up to 10 photos, 5 MB each |
| `video` | Direct video upload | 1 video, 50 MB max |
| `weather` | Weather forecast widget toggle | `showWeather` in EventSettings |
| `map` | Interactive map toggle | `showMap` in EventSettings |
