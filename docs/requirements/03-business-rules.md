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
| BR-EVT-02 | Status transitions are strictly `DRAFT → ACTIVE → FINISHED` — no backwards transitions, no skipping |
| BR-EVT-03 | An event can only be published (`DRAFT → ACTIVE`) if it has at minimum: `title`, `date`, `location` |
| BR-EVT-04 | Event fields can only be edited when status is `DRAFT` or `ACTIVE` (not `FINISHED`) |
| BR-EVT-05 | An event can only be deleted when status is `DRAFT` |
| BR-EVT-06 | Deleting an event cascades to: settings, template, photos, links, videos, uploaded videos, music, RSVPs |
| BR-EVT-08 | Creating an event auto-creates an `EventSettings` record with default values |
| BR-EVT-07 | Slug is auto-generated from title + random suffix, immutable after creation |

---

## 3. Public Page Visibility

| Rule | Description |
|------|-------------|
| BR-PUB-01 | `DRAFT` events return `404` on the public endpoint — they do not exist publicly |
| BR-PUB-02 | `ACTIVE` events return full invite data with `acceptingRsvp: true` |
| BR-PUB-03 | `FINISHED` events return full invite data with `acceptingRsvp: false` |
| BR-PUB-04 | Public endpoints never expose `event.id`, `event.userId`, or internal identifiers |
| BR-PUB-05 | Public page includes `host` object with organizer `name` and `image` only — never email or internal IDs |

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
| BR-LIM-01 | Max 10 photos per event |
| BR-LIM-02 | Max 10 links per event |
| BR-LIM-03 | Max 10 YouTube videos per event |
| BR-LIM-04 | Photo upload max file size: 5 MB |
| BR-LIM-05 | Photo accepted formats: JPEG, PNG, WebP |
| BR-LIM-06 | YouTube URL must match `youtube.com` or `youtu.be` domains |
| BR-LIM-07 | Max 3 uploaded videos per event |
| BR-LIM-08 | Uploaded video max file size: 50 MB |
| BR-LIM-09 | Uploaded video accepted formats: MP4, WebM |
| BR-LIM-10 | Max 5 music embeds (Spotify) per event |
| BR-LIM-11 | Spotify URL must match `open.spotify.com` domain |

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
| BR-SET-04 | `showWeather`: frontend renders weather forecast widget for event date/time/location via external API |
| BR-SET-05 | `showMap`: frontend renders interactive mini map with pin on event location, clickable to open Google Maps or Waze |
| BR-SET-06 | `acceptingRsvp` on the public page is `false` if event is `FINISHED` OR if `showRsvp` is `false` |
