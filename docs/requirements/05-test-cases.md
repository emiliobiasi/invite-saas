# Test Cases — InviteFlow BE

> Complete test case map for TDD phase. Each case maps to a business rule or validation rule.
> Test names read as sentences. Organized by module and test file.

---

## 1. Events — `events.routes.test.ts`

### POST /api/events (Create)

| # | Test Case | Rule |
|---|-----------|------|
| 1 | should create an event with status DRAFT and default settings | BR-EVT-01, BR-EVT-08 |
| 2 | should generate a unique slug from the title | BR-SLUG-01, BR-SLUG-02 |
| 3 | should strip accents and special characters from slug | BR-SLUG-01 |
| 4 | should return 401 when not authenticated | BR-AUTH-01 |
| 5 | should return 422 when title is missing | Validation |
| 6 | should return 422 when date is missing | Validation |
| 7 | should return 422 when location is missing | Validation |
| 8 | should return 422 when title exceeds 120 characters | Validation |
| 9 | should return 422 when date is in the past | Validation |

### GET /api/events (List)

| # | Test Case | Rule |
|---|-----------|------|
| 10 | should return only events belonging to the authenticated user | BR-AUTH-02 |
| 11 | should return events ordered by date descending | Spec |
| 12 | should return empty array when user has no events | Spec |
| 13 | should include RSVP counts per event | Spec |
| 14 | should return 401 when not authenticated | BR-AUTH-01 |

### GET /api/events/:id (Detail)

| # | Test Case | Rule |
|---|-----------|------|
| 15 | should return event with settings, template, photos, links, videos, uploaded videos, music, and RSVP counts | Spec |
| 16 | should return 403 when accessing another user's event | BR-AUTH-03 |
| 17 | should return 404 when event does not exist | Spec |
| 18 | should return 401 when not authenticated | BR-AUTH-01 |

### PATCH /api/events/:id (Update)

| # | Test Case | Rule |
|---|-----------|------|
| 19 | should update event fields when status is DRAFT | BR-EVT-04 |
| 20 | should update event fields when status is ACTIVE | BR-EVT-04 |
| 21 | should return 400 when status is FINISHED | BR-EVT-04 |
| 22 | should not regenerate slug when title changes | BR-SLUG-03 |
| 23 | should return 403 when updating another user's event | BR-AUTH-03 |
| 24 | should return 422 when no fields are provided | Validation |
| 25 | should return 422 when title exceeds 120 characters | Validation |

### DELETE /api/events/:id

| # | Test Case | Rule |
|---|-----------|------|
| 26 | should delete a DRAFT event and all related data (settings, template, photos, links, videos, uploaded videos, music, RSVPs) | BR-EVT-05, BR-EVT-06 |
| 27 | should return 400 when deleting an ACTIVE event | BR-EVT-05 |
| 28 | should return 400 when deleting a FINISHED event | BR-EVT-05 |
| 29 | should return 403 when deleting another user's event | BR-AUTH-03 |

### PATCH /api/events/:id/publish

| # | Test Case | Rule |
|---|-----------|------|
| 30 | should transition event from DRAFT to ACTIVE | BR-EVT-02 |
| 31 | should return 400 when event is already ACTIVE | BR-EVT-02 |
| 32 | should return 400 when event is FINISHED | BR-EVT-02 |
| 33 | should return 400 when event is missing required fields for publish | BR-EVT-03 |
| 34 | should return 403 when publishing another user's event | BR-AUTH-03 |

### PATCH /api/events/:id/finish

| # | Test Case | Rule |
|---|-----------|------|
| 35 | should transition event from ACTIVE to FINISHED | BR-EVT-02 |
| 36 | should return 400 when event is DRAFT | BR-EVT-02 |
| 37 | should return 400 when event is already FINISHED | BR-EVT-02 |
| 38 | should return 403 when finishing another user's event | BR-AUTH-03 |

---

## 2. Invite Template — `template.routes.test.ts`

### PUT /api/events/:id/template (Upsert)

| # | Test Case | Rule |
|---|-----------|------|
| 39 | should create a template for an event that has none | BR-TPL-01 |
| 40 | should update an existing template (upsert) | BR-TPL-02 |
| 41 | should apply default colors when not specified | BR-TPL-03 |
| 42 | should return 403 when updating template of another user's event | BR-AUTH-03 |
| 43 | should return 422 when headline exceeds 200 characters | Validation |
| 44 | should return 422 when primaryColor is not valid hex | Validation |
| 45 | should return 422 when backgroundUrl is not a valid URL | Validation |
| 46 | should save quoteText and quoteAuthor | BR-TPL-04 |
| 47 | should return 422 when quoteText exceeds 500 characters | Validation |
| 48 | should return 422 when quoteAuthor exceeds 100 characters | Validation |
| 49 | should return 401 when not authenticated | BR-AUTH-01 |

### GET /api/events/:id/template

| # | Test Case | Rule |
|---|-----------|------|
| 50 | should return the template for an event | Spec |
| 51 | should return 404 when event has no template | Spec |
| 52 | should return 403 when accessing template of another user's event | BR-AUTH-03 |

---

## 2b. Event Settings — `settings.routes.test.ts`

### GET /api/events/:id/settings

| # | Test Case | Rule |
|---|-----------|------|
| 53 | should return default settings (showRsvp: true, showWeather: false, showMap: false) | BR-SET-02 |
| 54 | should return 403 when accessing settings of another user's event | BR-AUTH-03 |
| 55 | should return 401 when not authenticated | BR-AUTH-01 |

### PATCH /api/events/:id/settings

| # | Test Case | Rule |
|---|-----------|------|
| 56 | should update showRsvp to false | BR-SET-01 |
| 57 | should update showWeather to true | BR-SET-01 |
| 58 | should update showMap to true | BR-SET-01 |
| 59 | should update multiple settings at once | BR-SET-01 |
| 60 | should return 422 when no fields are provided | Validation |
| 61 | should return 403 when updating settings of another user's event | BR-AUTH-03 |
| 62 | should return 401 when not authenticated | BR-AUTH-01 |

---

## 3. Event Photos — `photos.routes.test.ts`

### POST /api/events/:id/photos (Upload)

| # | Test Case | Rule |
|---|-----------|------|
| 63 | should upload a photo and return URL with order | Spec |
| 64 | should return 400 when event already has 10 photos | BR-LIM-01 |
| 65 | should return 400 when file exceeds 5 MB | BR-LIM-04 |
| 66 | should return 400 when file format is not JPEG, PNG, or WebP | BR-LIM-05 |
| 67 | should return 403 when uploading to another user's event | BR-AUTH-03 |
| 68 | should return 401 when not authenticated | BR-AUTH-01 |

### GET /api/events/:id/photos

| # | Test Case | Rule |
|---|-----------|------|
| 69 | should return photos ordered by order field | Spec |
| 70 | should return empty array when event has no photos | Spec |

### PATCH /api/events/:id/photos/:photoId

| # | Test Case | Rule |
|---|-----------|------|
| 71 | should update the order of a photo | Spec |
| 72 | should return 404 when photo does not exist | Spec |

### DELETE /api/events/:id/photos/:photoId

| # | Test Case | Rule |
|---|-----------|------|
| 73 | should delete a photo | Spec |
| 74 | should return 404 when photo does not exist | Spec |
| 75 | should return 403 when deleting photo from another user's event | BR-AUTH-03 |

---

## 4. Event Links — `links.routes.test.ts`

### POST /api/events/:id/links

| # | Test Case | Rule |
|---|-----------|------|
| 76 | should create a link with label and URL | Spec |
| 77 | should return 400 when event already has 10 links | BR-LIM-02 |
| 78 | should return 422 when label is missing | Validation |
| 79 | should return 422 when URL is missing | Validation |
| 80 | should return 422 when URL is not a valid URL | Validation |
| 81 | should return 422 when label exceeds 100 characters | Validation |
| 82 | should return 403 when adding link to another user's event | BR-AUTH-03 |
| 83 | should return 401 when not authenticated | BR-AUTH-01 |

### GET /api/events/:id/links

| # | Test Case | Rule |
|---|-----------|------|
| 84 | should return links ordered by order field | Spec |
| 85 | should return empty array when event has no links | Spec |

### PATCH /api/events/:id/links/:linkId

| # | Test Case | Rule |
|---|-----------|------|
| 86 | should update label and URL of a link | Spec |
| 87 | should update only the order of a link | Spec |
| 88 | should return 422 when no fields are provided | Validation |
| 89 | should return 404 when link does not exist | Spec |

### DELETE /api/events/:id/links/:linkId

| # | Test Case | Rule |
|---|-----------|------|
| 90 | should delete a link | Spec |
| 91 | should return 403 when deleting link from another user's event | BR-AUTH-03 |

---

## 5. YouTube Videos — `videos.routes.test.ts`

### POST /api/events/:id/videos

| # | Test Case | Rule |
|---|-----------|------|
| 92  | should create a video with valid YouTube URL | Spec |
| 93  | should accept youtu.be short URL format | Spec |
| 94  | should return 400 when event already has 10 videos | BR-LIM-03 |
| 95  | should return 422 when URL is missing | Validation |
| 96  | should return 422 when URL is not a YouTube URL | BR-LIM-06 |
| 97  | should return 422 when title exceeds 200 characters | Validation |
| 98  | should return 403 when adding video to another user's event | BR-AUTH-03 |
| 99  | should return 401 when not authenticated | BR-AUTH-01 |

### GET /api/events/:id/videos

| # | Test Case | Rule |
|---|-----------|------|
| 100 | should return videos ordered by order field | Spec |
| 101 | should return empty array when event has no videos | Spec |

### PATCH /api/events/:id/videos/:videoId

| # | Test Case | Rule |
|---|-----------|------|
| 102 | should update title and URL of a video | Spec |
| 103 | should return 422 when URL is not a YouTube URL | BR-LIM-06 |
| 104 | should return 404 when video does not exist | Spec |

### DELETE /api/events/:id/videos/:videoId

| # | Test Case | Rule |
|---|-----------|------|
| 105 | should delete a video | Spec |
| 106 | should return 403 when deleting video from another user's event | BR-AUTH-03 |

---

## 6. Uploaded Videos — `uploaded-videos.routes.test.ts`

### POST /api/events/:id/uploaded-videos (Upload)

| # | Test Case | Rule |
|---|-----------|------|
| 107 | should upload a video and return URL with order | Spec |
| 108 | should return 400 when event already has 3 uploaded videos | BR-LIM-07 |
| 109 | should return 400 when file exceeds 50 MB | BR-LIM-08 |
| 110 | should return 400 when file format is not MP4 or WebM | BR-LIM-09 |
| 111 | should return 403 when uploading to another user's event | BR-AUTH-03 |
| 112 | should return 401 when not authenticated | BR-AUTH-01 |

### GET /api/events/:id/uploaded-videos

| # | Test Case | Rule |
|---|-----------|------|
| 113 | should return uploaded videos ordered by order field | Spec |
| 114 | should return empty array when event has no uploaded videos | Spec |

### PATCH /api/events/:id/uploaded-videos/:videoId

| # | Test Case | Rule |
|---|-----------|------|
| 115 | should update title of an uploaded video | Spec |
| 116 | should update order of an uploaded video | Spec |
| 117 | should return 422 when no fields are provided | Validation |
| 118 | should return 404 when uploaded video does not exist | Spec |

### DELETE /api/events/:id/uploaded-videos/:videoId

| # | Test Case | Rule |
|---|-----------|------|
| 119 | should delete an uploaded video | Spec |
| 120 | should return 403 when deleting uploaded video from another user's event | BR-AUTH-03 |

---

## 7. Music (Spotify) — `music.routes.test.ts`

### POST /api/events/:id/music

| # | Test Case | Rule |
|---|-----------|------|
| 121 | should create a music embed with valid Spotify URL | Spec |
| 122 | should accept Spotify track, album, and playlist URLs | Spec |
| 123 | should return 400 when event already has 5 music embeds | BR-LIM-10 |
| 124 | should return 422 when spotifyUrl is missing | Validation |
| 125 | should return 422 when URL is not a Spotify URL | BR-LIM-11 |
| 126 | should return 422 when title exceeds 200 characters | Validation |
| 127 | should return 403 when adding music to another user's event | BR-AUTH-03 |
| 128 | should return 401 when not authenticated | BR-AUTH-01 |

### GET /api/events/:id/music

| # | Test Case | Rule |
|---|-----------|------|
| 129 | should return music ordered by order field | Spec |
| 130 | should return empty array when event has no music | Spec |

### PATCH /api/events/:id/music/:musicId

| # | Test Case | Rule |
|---|-----------|------|
| 131 | should update spotifyUrl and title | Spec |
| 132 | should return 422 when URL is not a Spotify URL | BR-LIM-11 |
| 133 | should return 422 when no fields are provided | Validation |
| 134 | should return 404 when music does not exist | Spec |

### DELETE /api/events/:id/music/:musicId

| # | Test Case | Rule |
|---|-----------|------|
| 135 | should delete a music embed | Spec |
| 136 | should return 403 when deleting music from another user's event | BR-AUTH-03 |

---

## 8. Public Page — `public.routes.test.ts`

### GET /api/public/:slug

| # | Test Case | Rule |
|---|-----------|------|
| 137 | should return full event data for an ACTIVE event | BR-PUB-02 |
| 138 | should return acceptingRsvp: true for ACTIVE events with showRsvp enabled | BR-PUB-02, BR-SET-06 |
| 139 | should return acceptingRsvp: false for FINISHED events | BR-PUB-03 |
| 140 | should return acceptingRsvp: false when showRsvp is disabled | BR-SET-06 |
| 141 | should return 404 for DRAFT events | BR-PUB-01 |
| 142 | should return 404 for non-existent slug | Spec |
| 143 | should not expose event id or userId in response | BR-PUB-04 |
| 144 | should include host name and image in response | BR-PUB-05 |
| 145 | should not expose host email or id | BR-PUB-05 |
| 146 | should include settings, template, photos, links, videos, uploaded videos, and music | Spec |
| 147 | should include RSVP counts breakdown | Spec |
| 148 | should include quoteText and quoteAuthor in template when present | BR-TPL-04 |
| 149 | should omit photos section when event has no photos | BR-SET-03 |
| 150 | should omit links section when event has no links | BR-SET-03 |
| 151 | should omit videos section when event has no videos | BR-SET-03 |
| 152 | should omit uploadedVideos section when event has no uploaded videos | BR-SET-03 |
| 153 | should omit music section when event has no music | BR-SET-03 |

### POST /api/public/:slug/rsvp

| # | Test Case | Rule |
|---|-----------|------|
| 154 | should create RSVP with status GOING | BR-RSVP-01 |
| 155 | should create RSVP with status NOT_GOING | BR-RSVP-01 |
| 156 | should create RSVP with status MAYBE | BR-RSVP-01 |
| 157 | should accept optional guestName | BR-RSVP-05 |
| 158 | should accept optional guestEmail | BR-RSVP-05 |
| 159 | should create RSVP with no guestName or guestEmail (zero-friction) | BR-RSVP-05 |
| 160 | should return updated RSVP counts after submission | BR-RSVP-07 |
| 161 | should allow multiple RSVPs to the same event (no dedup) | BR-RSVP-06 |
| 162 | should return 404 when event is DRAFT | BR-RSVP-02 |
| 163 | should return 400 when event is FINISHED | BR-RSVP-03 |
| 164 | should return 403 when RSVP is disabled (showRsvp: false) | BR-RSVP-08 |
| 165 | should return 422 when status is missing | Validation |
| 166 | should return 422 when status is invalid value | Validation |
| 167 | should return 422 when guestEmail is provided but invalid | Validation |
| 168 | should return 404 when slug does not exist | Spec |

---

## 9. Health — `health.routes.test.ts` (already exists)

| # | Test Case | Rule |
|---|-----------|------|
| 169 | should return status ok with timestamp | Spec |

---

## Summary

| Module           | Test File                        | Test Count |
|------------------|----------------------------------|------------|
| Events           | events.routes.test.ts            | 38         |
| Template         | template.routes.test.ts          | 14         |
| Settings         | settings.routes.test.ts          | 10         |
| Photos           | photos.routes.test.ts            | 13         |
| Links            | links.routes.test.ts             | 16         |
| YouTube Videos   | videos.routes.test.ts            | 15         |
| Uploaded Videos  | uploaded-videos.routes.test.ts   | 14         |
| Music (Spotify)  | music.routes.test.ts             | 16         |
| Public + RSVP    | public.routes.test.ts            | 32         |
| Health           | health.routes.test.ts            | 1          |
| **Total**        |                                  | **169**    |
