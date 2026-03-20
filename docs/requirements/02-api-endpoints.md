# API Endpoints — InviteFlow BE

> Complete endpoint specification for the backend REST API.

---

## Authentication

Auth is handled by Better Auth. These routes are delegated, not custom-built.

| Method | Route                          | Auth | Description                  |
|--------|--------------------------------|------|------------------------------|
| POST   | /api/auth/sign-up/email        | No   | Register with email/password |
| POST   | /api/auth/sign-in/email        | No   | Login with email/password    |
| POST   | /api/auth/sign-out             | Yes  | End session                  |
| GET    | /api/auth/get-session          | Yes  | Get current session/user     |

> Google OAuth is optional and configured via env vars. Server boots without it.

---

## Events

All event management endpoints require authentication.
The organizer can only access their own events (ownership enforcement).

### CRUD

| Method | Route              | Auth | Description                        |
|--------|--------------------|------|------------------------------------|
| POST   | /api/events        | Yes  | Create a new event (status: DRAFT) |
| GET    | /api/events        | Yes  | List organizer's events            |
| GET    | /api/events/:id    | Yes  | Get event details + RSVP counts    |
| PATCH  | /api/events/:id    | Yes  | Update event fields                |
| DELETE | /api/events/:id    | Yes  | Delete event (only if DRAFT)       |

### Status Transitions

| Method | Route                     | Auth | Description                    |
|--------|---------------------------|------|--------------------------------|
| PATCH  | /api/events/:id/publish   | Yes  | DRAFT → ACTIVE                 |
| PATCH  | /api/events/:id/finish    | Yes  | ACTIVE → FINISHED              |

---

### POST /api/events

Creates a new event with status `DRAFT`. Also auto-creates an `EventSettings` record with defaults.

**Request body:**
```json
{
  "title": "Festa de Formatura Medicina USP",
  "description": "Venha celebrar conosco!",
  "date": "2026-12-20T22:00:00Z",
  "location": "Av. Paulista, 1000 — São Paulo"
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "title": "Festa de Formatura Medicina USP",
  "description": "Venha celebrar conosco!",
  "date": "2026-12-20T22:00:00Z",
  "location": "Av. Paulista, 1000 — São Paulo",
  "slug": "festa-de-formatura-medicina-usp-a3k9x2",
  "status": "DRAFT",
  "settings": { "showRsvp": true, "showWeather": false, "showMap": false },
  "createdAt": "2026-03-19T10:00:00Z",
  "updatedAt": "2026-03-19T10:00:00Z"
}
```

---

### GET /api/events

Lists all events belonging to the authenticated organizer, ordered by `date DESC`.

**Response `200`:**
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Festa de Formatura",
      "date": "2026-12-20T22:00:00Z",
      "location": "Av. Paulista, 1000",
      "slug": "festa-de-formatura-a3k9x2",
      "status": "ACTIVE",
      "rsvpCount": { "going": 42, "notGoing": 5, "maybe": 12 }
    }
  ]
}
```

---

### GET /api/events/:id

Full event details including RSVP breakdown. Only the event owner can access.

**Response `200`:**
```json
{
  "id": "uuid",
  "title": "Festa de Formatura",
  "description": "Venha celebrar conosco!",
  "date": "2026-12-20T22:00:00Z",
  "location": "Av. Paulista, 1000",
  "slug": "festa-de-formatura-a3k9x2",
  "status": "ACTIVE",
  "createdAt": "...",
  "updatedAt": "...",
  "rsvpCount": { "going": 42, "notGoing": 5, "maybe": 12 },
  "settings": { "showRsvp": true, "showWeather": false, "showMap": true },
  "template": { "headline": "...", "message": "...", "backgroundUrl": "...", "primaryColor": "#E63946", "secondaryColor": "#1D3557" },
  "photos": [{ "id": "uuid", "url": "...", "order": 0 }],
  "links": [{ "id": "uuid", "label": "Instagram", "url": "https://...", "order": 0 }],
  "videos": [{ "id": "uuid", "url": "https://youtube.com/...", "title": "Playlist", "order": 0 }]
}
```

---

### PATCH /api/events/:id

Updates event fields. Only allowed when status is not `FINISHED`.

**Request body (all fields optional):**
```json
{
  "title": "Novo Título",
  "description": "Nova descrição",
  "date": "2026-12-21T22:00:00Z",
  "location": "Novo local"
}
```

**Response `200`:** Updated event object.

---

### DELETE /api/events/:id

Deletes an event and all related data (settings, template, photos, links, videos, RSVPs).
Only allowed when status is `DRAFT`.

**Response `204`:** No content.

---

### PATCH /api/events/:id/publish

Transitions event from `DRAFT` to `ACTIVE`. The public page becomes accessible.

**Preconditions:**
- Event must be in `DRAFT` status
- Event must have at least: title, date, location

**Response `200`:** Updated event with `status: "ACTIVE"`.

---

### PATCH /api/events/:id/finish

Transitions event from `ACTIVE` to `FINISHED`. RSVPs are no longer accepted.

**Response `200`:** Updated event with `status: "FINISHED"`.

---

## Invite Template

One template per event. Upsert semantics (create or update).

| Method | Route                       | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| PUT    | /api/events/:id/template    | Yes  | Create/update template   |
| GET    | /api/events/:id/template    | Yes  | Get template             |

### PUT /api/events/:id/template

**Request body (all fields optional):**
```json
{
  "headline": "Você está convidado!",
  "message": "Vai ser incrível, não perde!",
  "backgroundUrl": "https://...",
  "primaryColor": "#E63946",
  "secondaryColor": "#1D3557"
}
```

**Response `200`:** Template object.

---

## Event Settings

Component visibility toggles. One per event (1:1). Auto-created with the event.

| Method | Route                       | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| PATCH  | /api/events/:id/settings    | Yes  | Update settings          |
| GET    | /api/events/:id/settings    | Yes  | Get settings             |

### PATCH /api/events/:id/settings

**Request body (all fields optional):**
```json
{
  "showRsvp": true,
  "showWeather": true,
  "showMap": true
}
```

At least one field must be provided.

**Response `200`:**
```json
{
  "showRsvp": true,
  "showWeather": true,
  "showMap": true
}
```

### GET /api/events/:id/settings

**Response `200`:**
```json
{
  "showRsvp": true,
  "showWeather": false,
  "showMap": false
}
```

---

## Event Photos

Upload and manage photos for the event carousel.

| Method | Route                              | Auth | Description              |
|--------|------------------------------------|------|--------------------------|
| POST   | /api/events/:id/photos             | Yes  | Upload a photo           |
| GET    | /api/events/:id/photos             | Yes  | List photos (ordered)    |
| PATCH  | /api/events/:id/photos/:photoId    | Yes  | Update order             |
| DELETE | /api/events/:id/photos/:photoId    | Yes  | Delete a photo           |

### POST /api/events/:id/photos

**Request:** `multipart/form-data` with `file` field (image).

**Constraints:**
- Max file size: 5 MB
- Accepted formats: JPEG, PNG, WebP
- Max 10 photos per event

**Response `201`:**
```json
{
  "id": "uuid",
  "url": "https://storage.../photo.jpg",
  "order": 3
}
```

---

## Event Links

Manage custom links on the invite page.

| Method | Route                             | Auth | Description          |
|--------|-----------------------------------|------|----------------------|
| POST   | /api/events/:id/links             | Yes  | Add a link           |
| GET    | /api/events/:id/links             | Yes  | List links (ordered) |
| PATCH  | /api/events/:id/links/:linkId     | Yes  | Update link          |
| DELETE | /api/events/:id/links/:linkId     | Yes  | Delete a link        |

### POST /api/events/:id/links

**Request body:**
```json
{
  "label": "Nosso Instagram",
  "url": "https://instagram.com/evento"
}
```

**Constraints:**
- Max 10 links per event

**Response `201`:** Link object with `id`, `label`, `url`, `order`.

---

## Event Videos

Manage YouTube video embeds on the invite page.

| Method | Route                               | Auth | Description           |
|--------|-------------------------------------|------|-----------------------|
| POST   | /api/events/:id/videos              | Yes  | Add a video           |
| GET    | /api/events/:id/videos              | Yes  | List videos (ordered) |
| PATCH  | /api/events/:id/videos/:videoId     | Yes  | Update video          |
| DELETE | /api/events/:id/videos/:videoId     | Yes  | Delete a video        |

### POST /api/events/:id/videos

**Request body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Playlist da Festa"
}
```

**Constraints:**
- Max 10 videos per event
- URL must be a valid YouTube URL

**Response `201`:** Video object with `id`, `url`, `title`, `order`.

---

## Public Page (No Auth)

These endpoints are public — no authentication required.

| Method | Route                    | Auth | Description                       |
|--------|--------------------------|------|-----------------------------------|
| GET    | /api/public/:slug        | No   | Get public event page data        |
| POST   | /api/public/:slug/rsvp   | No   | Submit RSVP response              |

### GET /api/public/:slug

Returns all data needed to render the public invite page.

**Behavior by status:**
- `DRAFT` → `404 Not Found`
- `ACTIVE` → Full event data + template + settings + optional sections + RSVP counts + `acceptingRsvp: true`
- `FINISHED` → Same data but `acceptingRsvp: false`

**Response `200`:**
```json
{
  "event": {
    "title": "Festa de Formatura",
    "description": "Venha celebrar!",
    "date": "2026-12-20T22:00:00Z",
    "location": "Av. Paulista, 1000",
    "status": "ACTIVE",
    "acceptingRsvp": true
  },
  "settings": {
    "showRsvp": true,
    "showWeather": true,
    "showMap": true
  },
  "template": {
    "headline": "Você está convidado!",
    "message": "Vai ser incrível!",
    "backgroundUrl": "https://...",
    "primaryColor": "#E63946",
    "secondaryColor": "#1D3557"
  },
  "photos": [{ "url": "...", "order": 0 }],
  "links": [{ "label": "Instagram", "url": "https://...", "order": 0 }],
  "videos": [{ "url": "https://youtube.com/...", "title": "Playlist", "order": 0 }],
  "rsvpCount": { "going": 42, "notGoing": 5, "maybe": 12 }
}
```

> Note: public endpoint does NOT expose event `id`, `userId`, or `slug` in the response.

**Component visibility on public page:**
- `photos`, `links`, `videos` — included in response only if records exist (presence-based)
- `rsvpCount` — included only if `settings.showRsvp` is `true`
- `acceptingRsvp` — `false` if event is FINISHED **or** if `settings.showRsvp` is `false`
- `settings.showWeather` / `settings.showMap` — frontend reads these flags to render components
  (weather data fetched client-side from weather API, map rendered client-side from location)

---

### POST /api/public/:slug/rsvp

Submit a guest response to the event.

**Request body:**
```json
{
  "status": "GOING",
  "guestName": "Maria",
  "guestEmail": "maria@email.com"
}
```

- `status` is **required**: `"GOING"`, `"NOT_GOING"`, or `"MAYBE"`
- `guestName` is **optional**
- `guestEmail` is **optional**, validated as email format if provided

**Behavior:**
- Event must be `ACTIVE` — otherwise `400` or `404`
- Event must have `settings.showRsvp = true` — otherwise `403` (RSVP disabled)
- Creates a new RSVP record (no deduplication in MVP)

**Response `201`:**
```json
{
  "rsvpCount": { "going": 43, "notGoing": 5, "maybe": 12 }
}
```

---

## Health Check

| Method | Route        | Auth | Description          |
|--------|------------- |------|----------------------|
| GET    | /health      | No   | Service health check |

**Response `200`:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-19T10:00:00Z"
}
```
