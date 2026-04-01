# Validation Rules — InviteFlow BE

> Input validation schemas for all endpoints. All validation uses Zod at the boundary.

---

## Event

### Create Event (`POST /api/events`)

| Field       | Type     | Required | Constraints                        |
|-------------|----------|----------|------------------------------------|
| title       | string   | yes      | min 1, max 120 chars, trimmed      |
| description | string   | no       | max 2000 chars, trimmed            |
| date        | string   | yes      | valid ISO 8601 datetime, must be in the future |
| location    | string   | yes      | min 1, max 300 chars, trimmed      |

### Update Event (`PATCH /api/events/:id`)

Same fields as create, but all optional. At least one field must be provided.

### Path Parameters

| Param | Constraints             |
|-------|-------------------------|
| id    | valid UUID              |
| slug  | lowercase, alphanumeric + hyphens |

---

## Invite Template

### Upsert Template (`PUT /api/events/:id/template`)

| Field          | Type   | Required | Constraints                       |
|----------------|--------|----------|-----------------------------------|
| headline       | string | no       | max 200 chars, trimmed            |
| message        | string | no       | max 2000 chars, trimmed           |
| backgroundUrl  | string | no       | valid URL format                  |
| primaryColor   | string | no       | valid hex color (`#RRGGBB`)       |
| secondaryColor | string | no       | valid hex color (`#RRGGBB`)       |
| quoteText      | string | no       | max 500 chars, trimmed            |
| quoteAuthor    | string | no       | max 100 chars, trimmed            |

---

## Event Settings

### Update Settings (`PATCH /api/events/:id/settings`)

| Field       | Type    | Required | Constraints |
|-------------|---------|----------|-------------|
| showRsvp    | boolean | no       | —           |
| showWeather | boolean | no       | requires `EventFeatures.weatherEnabled = true` to set to `true` |
| showMap     | boolean | no       | requires `EventFeatures.mapEnabled = true` to set to `true` |

At least one field must be provided.

---

## Event Photos

### Upload Photo (`POST /api/events/:id/photos`)

| Field | Type | Required | Constraints                          |
|-------|------|----------|--------------------------------------|
| file  | file | yes      | max 5 MB, mime: image/jpeg, image/png, image/webp. Requires `EventFeatures.photosEnabled = true` |

### Update Photo (`PATCH /api/events/:id/photos/:photoId`)

| Field | Type    | Required | Constraints      |
|-------|---------|----------|------------------|
| order | integer | yes      | >= 0             |

---

## Event Links

### Create Link (`POST /api/events/:id/links`)

| Field | Type   | Required | Constraints                |
|-------|--------|----------|----------------------------|
| label | string | yes      | min 1, max 100 chars       |
| url   | string | yes      | valid URL format           |

### Update Link (`PATCH /api/events/:id/links/:linkId`)

| Field | Type   | Required | Constraints                |
|-------|--------|----------|----------------------------|
| label | string | no       | min 1, max 100 chars       |
| url   | string | no       | valid URL format           |
| order | integer| no       | >= 0                       |

At least one field must be provided.

---

## Event Videos

### Create Video (`POST /api/events/:id/videos`)

| Field | Type   | Required | Constraints                                        |
|-------|--------|----------|----------------------------------------------------|
| url   | string | yes      | valid YouTube URL (youtube.com/watch or youtu.be)  |
| title | string | no       | max 200 chars                                      |

### Update Video (`PATCH /api/events/:id/videos/:videoId`)

| Field | Type   | Required | Constraints                                        |
|-------|--------|----------|----------------------------------------------------|
| url   | string | no       | valid YouTube URL (youtube.com/watch or youtu.be)  |
| title | string | no       | max 200 chars                                      |
| order | integer| no       | >= 0                                               |

At least one field must be provided.

---

## Uploaded Videos

### Upload Video (`POST /api/events/:id/uploaded-videos`)

| Field | Type   | Required | Constraints                          |
|-------|--------|----------|--------------------------------------|
| file  | file   | yes      | max 50 MB, mime: video/mp4, video/webm. Requires `EventFeatures.videoEnabled = true` |
| title | string | no       | max 200 chars, trimmed               |

### Update Uploaded Video (`PATCH /api/events/:id/uploaded-videos/:videoId`)

| Field | Type    | Required | Constraints      |
|-------|---------|----------|------------------|
| title | string  | no       | max 200 chars    |
| order | integer | no       | >= 0             |

At least one field must be provided.

---

## Music (Spotify)

### Create Music (`POST /api/events/:id/music`)

| Field      | Type   | Required | Constraints                                        |
|------------|--------|----------|----------------------------------------------------|
| spotifyUrl | string | yes      | valid Spotify URL (open.spotify.com)               |
| title      | string | no       | max 200 chars                                      |

### Update Music (`PATCH /api/events/:id/music/:musicId`)

| Field      | Type    | Required | Constraints                                        |
|------------|---------|----------|----------------------------------------------------|
| spotifyUrl | string  | no       | valid Spotify URL (open.spotify.com)               |
| title      | string  | no       | max 200 chars                                      |
| order      | integer | no       | >= 0                                               |

At least one field must be provided.

---

## RSVP

### Submit RSVP (`POST /api/public/:slug/rsvp`)

| Field      | Type   | Required | Constraints                          |
|------------|--------|----------|--------------------------------------|
| status     | enum   | yes      | `"GOING"`, `"NOT_GOING"`, `"MAYBE"` |
| guestName  | string | no       | max 100 chars, trimmed               |
| guestEmail | string | no       | valid email format if provided       |

---

## Error Response Format

All validation errors return `422` with a consistent shape:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

## Standard Error Codes

| HTTP Status | Error Code       | When                                    |
|-------------|------------------|-----------------------------------------|
| 400         | BAD_REQUEST            | Invalid status transition, event closed      |
| 401         | UNAUTHORIZED           | Missing or invalid session                   |
| 402         | PAYMENT_REQUIRED       | Event requires payment before this action    |
| 403         | FORBIDDEN              | Accessing another user's resource / RSVP disabled |
| 403         | FEATURE_NOT_PURCHASED  | Paid feature not purchased for this event    |
| 404         | NOT_FOUND              | Resource does not exist                      |
| 409         | CONFLICT               | Duplicate slug (retry with new suffix)       |
| 410         | EVENT_EXPIRED          | Event has expired and is archived            |
| 422         | VALIDATION_ERROR       | Input validation failure                     |
| 503         | STRIPE_NOT_CONFIGURED  | Stripe is not configured on the server       |

---

## Stripe Checkout

### Create Checkout Session (`POST /api/stripe/create-checkout`)

| Field        | Type   | Required | Constraints                                          |
|--------------|--------|----------|------------------------------------------------------|
| eventId      | uuid   | yes      | valid Event ID owned by authenticated user           |
| planDuration | enum   | yes      | `"1_MONTH"`, `"3_MONTHS"`, `"6_MONTHS"`             |
| addons       | object | yes      | `{ photos: bool, video: bool, weather: bool, map: bool }` |
| successUrl   | string | yes      | valid URL for redirect after payment                 |
| cancelUrl    | string | yes      | valid URL for redirect on cancel                     |

### Checkout Preconditions

| Condition | Error |
|-----------|-------|
| Event must exist and belong to authenticated user | 403 FORBIDDEN |
| Event must be in DRAFT status | 400 BAD_REQUEST |
| Event must not already have a COMPLETED purchase | 400 BAD_REQUEST |
| Stripe must be configured | 503 STRIPE_NOT_CONFIGURED |
