# Test Cases — InviteFlow BE

> Complete test case map for TDD phase. Each case maps to a business rule or validation rule.
> Test names read as sentences. Organized by module and test file.

---

## 1. Events — `events.routes.test.ts`

### POST /api/events (Create)

| #   | Test Case                                                     | Rule                   |
| --- | ------------------------------------------------------------- | ---------------------- |
| 1   | should create an event with status DRAFT and default settings | BR-EVT-01, BR-EVT-08   |
| 2   | should generate a unique slug from the title                  | BR-SLUG-01, BR-SLUG-02 |
| 3   | should strip accents and special characters from slug         | BR-SLUG-01             |
| 4   | should return 401 when not authenticated                      | BR-AUTH-01             |
| 5   | should return 422 when title is missing                       | Validation             |
| 6   | should return 422 when date is missing                        | Validation             |
| 7   | should return 422 when location is missing                    | Validation             |
| 8   | should return 422 when title exceeds 120 characters           | Validation             |
| 9   | should return 422 when date is in the past                    | Validation             |

### GET /api/events (List)

| #   | Test Case                                                     | Rule       |
| --- | ------------------------------------------------------------- | ---------- |
| 10  | should return only events belonging to the authenticated user | BR-AUTH-02 |
| 11  | should return events ordered by date descending               | Spec       |
| 12  | should return empty array when user has no events             | Spec       |
| 13  | should include RSVP counts per event                          | Spec       |
| 14  | should return 401 when not authenticated                      | BR-AUTH-01 |

### GET /api/events/:id (Detail)

| #   | Test Case                                                                                                   | Rule       |
| --- | ----------------------------------------------------------------------------------------------------------- | ---------- |
| 15  | should return event with settings, template, photos, links, videos, uploaded videos, music, and RSVP counts | Spec       |
| 16  | should return 403 when accessing another user's event                                                       | BR-AUTH-03 |
| 17  | should return 404 when event does not exist                                                                 | Spec       |
| 18  | should return 401 when not authenticated                                                                    | BR-AUTH-01 |

### PATCH /api/events/:id (Update)

| #   | Test Case                                            | Rule       |
| --- | ---------------------------------------------------- | ---------- |
| 19  | should update event fields when status is DRAFT      | BR-EVT-04  |
| 20  | should update event fields when status is ACTIVE     | BR-EVT-04  |
| 21  | should return 400 when status is FINISHED            | BR-EVT-04  |
| 22  | should not regenerate slug when title changes        | BR-SLUG-03 |
| 23  | should return 403 when updating another user's event | BR-AUTH-03 |
| 24  | should return 422 when no fields are provided        | Validation |
| 25  | should return 422 when title exceeds 120 characters  | Validation |

### DELETE /api/events/:id

| #   | Test Case                                                                                                                   | Rule                 |
| --- | --------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 26  | should delete a DRAFT event and all related data (settings, template, photos, links, videos, uploaded videos, music, RSVPs) | BR-EVT-05, BR-EVT-06 |
| 27  | should return 400 when deleting an ACTIVE event                                                                             | BR-EVT-05            |
| 28  | should return 400 when deleting a FINISHED event                                                                            | BR-EVT-05            |
| 29  | should return 403 when deleting another user's event                                                                        | BR-AUTH-03           |

### PATCH /api/events/:id/publish

| #   | Test Case                                                                            | Rule                 |
| --- | ------------------------------------------------------------------------------------ | -------------------- |
| 30  | should transition event from DRAFT to ACTIVE when payment is completed               | BR-EVT-02, BR-EVT-09 |
| 31  | should return 400 when event is already ACTIVE                                       | BR-EVT-02            |
| 32  | should return 400 when event is FINISHED                                             | BR-EVT-02            |
| 33  | should return 400 when event is missing required fields for publish                  | BR-EVT-03            |
| 34  | should return 403 when publishing another user's event                               | BR-AUTH-03           |
| 35  | should return 402 when payment is not completed (no EventPurchase or status PENDING) | BR-EVT-09            |
| 36  | should set publishedAt when transitioning to ACTIVE                                  | BR-EVT-10            |
| 37  | should calculate expiresAt as publishedAt + planDuration                             | BR-EVT-11            |
| 38  | should return 400 when event is ARCHIVED                                             | BR-EVT-02            |

### PATCH /api/events/:id/finish

| #   | Test Case                                                          | Rule       |
| --- | ------------------------------------------------------------------ | ---------- |
| 39  | should transition event from ACTIVE to FINISHED                    | BR-EVT-02  |
| 40  | should set postEventExpiresAt based on planDuration when finishing | BR-EVT-12  |
| 41  | should return 400 when event is DRAFT                              | BR-EVT-02  |
| 42  | should return 400 when event is already FINISHED                   | BR-EVT-02  |
| 43  | should return 403 when finishing another user's event              | BR-AUTH-03 |

---

## 2. Invite Template — `template.routes.test.ts`

### PUT /api/events/:id/template (Upsert)

| #   | Test Case                                                        | Rule       |
| --- | ---------------------------------------------------------------- | ---------- |
| 44  | should create a template for an event that has none              | BR-TPL-01  |
| 45  | should update an existing template (upsert)                      | BR-TPL-02  |
| 46  | should apply default colors when not specified                   | BR-TPL-03  |
| 47  | should return 403 when updating template of another user's event | BR-AUTH-03 |
| 48  | should return 422 when headline exceeds 200 characters           | Validation |
| 49  | should return 422 when primaryColor is not valid hex             | Validation |
| 50  | should return 422 when backgroundUrl is not a valid URL          | Validation |
| 51  | should save quoteText and quoteAuthor                            | BR-TPL-04  |
| 52  | should return 422 when quoteText exceeds 500 characters          | Validation |
| 53  | should return 422 when quoteAuthor exceeds 100 characters        | Validation |
| 54  | should return 401 when not authenticated                         | BR-AUTH-01 |

### GET /api/events/:id/template

| #   | Test Case                                                         | Rule       |
| --- | ----------------------------------------------------------------- | ---------- |
| 55  | should return the template for an event                           | Spec       |
| 56  | should return 404 when event has no template                      | Spec       |
| 57  | should return 403 when accessing template of another user's event | BR-AUTH-03 |

---

## 2b. Event Settings — `settings.routes.test.ts`

### GET /api/events/:id/settings

| #   | Test Case                                                                           | Rule       |
| --- | ----------------------------------------------------------------------------------- | ---------- |
| 58  | should return default settings (showRsvp: true, showWeather: false, showMap: false) | BR-SET-02  |
| 59  | should return 403 when accessing settings of another user's event                   | BR-AUTH-03 |
| 60  | should return 401 when not authenticated                                            | BR-AUTH-01 |

### PATCH /api/events/:id/settings

| #   | Test Case                                                          | Rule                 |
| --- | ------------------------------------------------------------------ | -------------------- |
| 61  | should update showRsvp to false                                    | BR-SET-01            |
| 62  | should update showWeather to true when weather add-on is purchased | BR-SET-01, BR-SET-04 |
| 63  | should update showMap to true when map add-on is purchased         | BR-SET-01, BR-SET-05 |
| 64  | should update multiple settings at once                            | BR-SET-01            |
| 65  | should return 422 when no fields are provided                      | Validation           |
| 66  | should return 403 when updating settings of another user's event   | BR-AUTH-03           |
| 67  | should return 401 when not authenticated                           | BR-AUTH-01           |
| 68  | should return 403 when enabling showWeather without weather add-on | BR-SET-04            |
| 69  | should return 403 when enabling showMap without map add-on         | BR-SET-05            |

---

## 3. Event Photos — `photos.routes.test.ts`

### POST /api/events/:id/photos (Upload)

| #   | Test Case                                                    | Rule       |
| --- | ------------------------------------------------------------ | ---------- |
| 70  | should upload a photo and return URL with order              | Spec       |
| 71  | should return 400 when event already has 10 photos           | BR-LIM-01  |
| 72  | should return 400 when file exceeds 5 MB                     | BR-LIM-04  |
| 73  | should return 400 when file format is not JPEG, PNG, or WebP | BR-LIM-05  |
| 74  | should return 403 when uploading to another user's event     | BR-AUTH-03 |
| 75  | should return 401 when not authenticated                     | BR-AUTH-01 |
| 76  | should return 403 when photos add-on is not purchased        | BR-LIM-12  |

### GET /api/events/:id/photos

| #   | Test Case                                          | Rule |
| --- | -------------------------------------------------- | ---- |
| 77  | should return photos ordered by order field        | Spec |
| 78  | should return empty array when event has no photos | Spec |

### PATCH /api/events/:id/photos/:photoId

| #   | Test Case                                   | Rule |
| --- | ------------------------------------------- | ---- |
| 79  | should update the order of a photo          | Spec |
| 80  | should return 404 when photo does not exist | Spec |

### DELETE /api/events/:id/photos/:photoId

| #   | Test Case                                                       | Rule       |
| --- | --------------------------------------------------------------- | ---------- |
| 81  | should delete a photo                                           | Spec       |
| 82  | should return 404 when photo does not exist                     | Spec       |
| 83  | should return 403 when deleting photo from another user's event | BR-AUTH-03 |

---

## 4. Event Links — `links.routes.test.ts`

### POST /api/events/:id/links

| #   | Test Case                                                  | Rule       |
| --- | ---------------------------------------------------------- | ---------- |
| 84  | should create a link with label and URL                    | Spec       |
| 85  | should return 400 when event already has 10 links          | BR-LIM-02  |
| 86  | should return 422 when label is missing                    | Validation |
| 87  | should return 422 when URL is missing                      | Validation |
| 88  | should return 422 when URL is not a valid URL              | Validation |
| 89  | should return 422 when label exceeds 100 characters        | Validation |
| 90  | should return 403 when adding link to another user's event | BR-AUTH-03 |
| 91  | should return 401 when not authenticated                   | BR-AUTH-01 |

### GET /api/events/:id/links

| #   | Test Case                                         | Rule |
| --- | ------------------------------------------------- | ---- |
| 92  | should return links ordered by order field        | Spec |
| 93  | should return empty array when event has no links | Spec |

### PATCH /api/events/:id/links/:linkId

| #   | Test Case                                     | Rule       |
| --- | --------------------------------------------- | ---------- |
| 94  | should update label and URL of a link         | Spec       |
| 95  | should update only the order of a link        | Spec       |
| 96  | should return 422 when no fields are provided | Validation |
| 97  | should return 404 when link does not exist    | Spec       |

### DELETE /api/events/:id/links/:linkId

| #   | Test Case                                                      | Rule       |
| --- | -------------------------------------------------------------- | ---------- |
| 98  | should delete a link                                           | Spec       |
| 99  | should return 403 when deleting link from another user's event | BR-AUTH-03 |

---

## 5. YouTube Videos — `videos.routes.test.ts`

### POST /api/events/:id/videos

| #   | Test Case                                                   | Rule       |
| --- | ----------------------------------------------------------- | ---------- |
| 100 | should create a video with valid YouTube URL                | Spec       |
| 101 | should accept youtu.be short URL format                     | Spec       |
| 102 | should return 400 when event already has 10 videos          | BR-LIM-03  |
| 103 | should return 422 when URL is missing                       | Validation |
| 104 | should return 422 when URL is not a YouTube URL             | BR-LIM-06  |
| 105 | should return 422 when title exceeds 200 characters         | Validation |
| 106 | should return 403 when adding video to another user's event | BR-AUTH-03 |
| 107 | should return 401 when not authenticated                    | BR-AUTH-01 |

### GET /api/events/:id/videos

| #   | Test Case                                          | Rule |
| --- | -------------------------------------------------- | ---- |
| 108 | should return videos ordered by order field        | Spec |
| 109 | should return empty array when event has no videos | Spec |

### PATCH /api/events/:id/videos/:videoId

| #   | Test Case                                       | Rule      |
| --- | ----------------------------------------------- | --------- |
| 110 | should update title and URL of a video          | Spec      |
| 111 | should return 422 when URL is not a YouTube URL | BR-LIM-06 |
| 112 | should return 404 when video does not exist     | Spec      |

### DELETE /api/events/:id/videos/:videoId

| #   | Test Case                                                       | Rule       |
| --- | --------------------------------------------------------------- | ---------- |
| 113 | should delete a video                                           | Spec       |
| 114 | should return 403 when deleting video from another user's event | BR-AUTH-03 |

---

## 6. Uploaded Videos — `uploaded-videos.routes.test.ts`

### POST /api/events/:id/uploaded-videos (Upload)

| #   | Test Case                                                  | Rule       |
| --- | ---------------------------------------------------------- | ---------- |
| 115 | should upload a video and return URL with order            | Spec       |
| 116 | should return 400 when event already has 3 uploaded videos | BR-LIM-07  |
| 117 | should return 400 when file exceeds 50 MB                  | BR-LIM-08  |
| 118 | should return 400 when file format is not MP4 or WebM      | BR-LIM-09  |
| 119 | should return 403 when uploading to another user's event   | BR-AUTH-03 |
| 120 | should return 401 when not authenticated                   | BR-AUTH-01 |

### GET /api/events/:id/uploaded-videos

| #   | Test Case                                                   | Rule |
| --- | ----------------------------------------------------------- | ---- |
| 121 | should return uploaded videos ordered by order field        | Spec |
| 122 | should return empty array when event has no uploaded videos | Spec |

### PATCH /api/events/:id/uploaded-videos/:videoId

| #   | Test Case                                            | Rule       |
| --- | ---------------------------------------------------- | ---------- |
| 123 | should update title of an uploaded video             | Spec       |
| 124 | should update order of an uploaded video             | Spec       |
| 125 | should return 422 when no fields are provided        | Validation |
| 126 | should return 404 when uploaded video does not exist | Spec       |

### DELETE /api/events/:id/uploaded-videos/:videoId

| #   | Test Case                                                                | Rule       |
| --- | ------------------------------------------------------------------------ | ---------- |
| 127 | should delete an uploaded video                                          | Spec       |
| 128 | should return 403 when deleting uploaded video from another user's event | BR-AUTH-03 |

---

## 7. Music (Spotify) — `music.routes.test.ts`

### POST /api/events/:id/music

| #   | Test Case                                                   | Rule       |
| --- | ----------------------------------------------------------- | ---------- |
| 129 | should create a music embed with valid Spotify URL          | Spec       |
| 130 | should accept Spotify track, album, and playlist URLs       | Spec       |
| 131 | should return 400 when event already has 5 music embeds     | BR-LIM-10  |
| 132 | should return 422 when spotifyUrl is missing                | Validation |
| 133 | should return 422 when URL is not a Spotify URL             | BR-LIM-11  |
| 134 | should return 422 when title exceeds 200 characters         | Validation |
| 135 | should return 403 when adding music to another user's event | BR-AUTH-03 |
| 136 | should return 401 when not authenticated                    | BR-AUTH-01 |

### GET /api/events/:id/music

| #   | Test Case                                         | Rule |
| --- | ------------------------------------------------- | ---- |
| 137 | should return music ordered by order field        | Spec |
| 138 | should return empty array when event has no music | Spec |

### PATCH /api/events/:id/music/:musicId

| #   | Test Case                                       | Rule       |
| --- | ----------------------------------------------- | ---------- |
| 139 | should update spotifyUrl and title              | Spec       |
| 140 | should return 422 when URL is not a Spotify URL | BR-LIM-11  |
| 141 | should return 422 when no fields are provided   | Validation |
| 142 | should return 404 when music does not exist     | Spec       |

### DELETE /api/events/:id/music/:musicId

| #   | Test Case                                                       | Rule       |
| --- | --------------------------------------------------------------- | ---------- |
| 143 | should delete a music embed                                     | Spec       |
| 144 | should return 403 when deleting music from another user's event | BR-AUTH-03 |

---

## 8. Public Page — `public.routes.test.ts`

### GET /api/public/:slug

| #   | Test Case                                                                            | Rule                 |
| --- | ------------------------------------------------------------------------------------ | -------------------- |
| 145 | should return full event data for an ACTIVE event                                    | BR-PUB-02            |
| 146 | should return acceptingRsvp: true for ACTIVE events with showRsvp enabled            | BR-PUB-02, BR-SET-06 |
| 147 | should return acceptingRsvp: false for FINISHED events                               | BR-PUB-03            |
| 148 | should return acceptingRsvp: false when showRsvp is disabled                         | BR-SET-06            |
| 149 | should return 404 for DRAFT events                                                   | BR-PUB-01            |
| 150 | should return 404 for non-existent slug                                              | Spec                 |
| 151 | should not expose event id or userId in response                                     | BR-PUB-04            |
| 152 | should include host name and image in response                                       | BR-PUB-05            |
| 153 | should not expose host email or id                                                   | BR-PUB-05            |
| 154 | should include settings, template, photos, links, videos, uploaded videos, and music | Spec                 |
| 155 | should include RSVP counts breakdown                                                 | Spec                 |
| 156 | should include quoteText and quoteAuthor in template when present                    | BR-TPL-04            |
| 157 | should omit photos section when event has no photos                                  | BR-SET-03            |
| 158 | should omit links section when event has no links                                    | BR-SET-03            |
| 159 | should omit videos section when event has no videos                                  | BR-SET-03            |
| 160 | should omit uploadedVideos section when event has no uploaded videos                 | BR-SET-03            |
| 161 | should omit music section when event has no music                                    | BR-SET-03            |

### POST /api/public/:slug/rsvp

| #   | Test Case                                                          | Rule       |
| --- | ------------------------------------------------------------------ | ---------- |
| 162 | should create RSVP with status GOING                               | BR-RSVP-01 |
| 163 | should create RSVP with status NOT_GOING                           | BR-RSVP-01 |
| 164 | should create RSVP with status MAYBE                               | BR-RSVP-01 |
| 165 | should accept optional guestName                                   | BR-RSVP-05 |
| 166 | should accept optional guestEmail                                  | BR-RSVP-05 |
| 167 | should create RSVP with no guestName or guestEmail (zero-friction) | BR-RSVP-05 |
| 168 | should return updated RSVP counts after submission                 | BR-RSVP-07 |
| 169 | should allow multiple RSVPs to the same event (no dedup)           | BR-RSVP-06 |
| 170 | should return 404 when event is DRAFT                              | BR-RSVP-02 |
| 171 | should return 400 when event is FINISHED                           | BR-RSVP-03 |
| 172 | should return 403 when RSVP is disabled (showRsvp: false)          | BR-RSVP-08 |
| 173 | should return 422 when status is missing                           | Validation |
| 174 | should return 422 when status is invalid value                     | Validation |
| 175 | should return 422 when guestEmail is provided but invalid          | Validation |
| 176 | should return 404 when slug does not exist                         | Spec       |

---

## 9. Health — `health.routes.test.ts` (already exists)

| #   | Test Case                              | Rule |
| --- | -------------------------------------- | ---- |
| 177 | should return status ok with timestamp | Spec |

---

## Summary

| Module          | Test File                      | Test Count |
| --------------- | ------------------------------ | ---------- |
| Events          | events.routes.test.ts          | 43         |
| Template        | template.routes.test.ts        | 14         |
| Settings        | settings.routes.test.ts        | 12         |
| Photos          | photos.routes.test.ts          | 14         |
| Links           | links.routes.test.ts           | 16         |
| YouTube Videos  | videos.routes.test.ts          | 15         |
| Uploaded Videos | uploaded-videos.routes.test.ts | 14         |
| Music (Spotify) | music.routes.test.ts           | 16         |
| Public + RSVP   | public.routes.test.ts          | 32         |
| Health          | health.routes.test.ts          | 1          |
| **Total**       |                                | **177**    |
