# bnco API Reference

**Base URL:** `https://api.bnco.app` (production) | `http://localhost:3001` (local dev)
**Content-Type:** `application/json` for all request/response bodies
**Authentication:** Bearer token in `Authorization` header unless marked Public

---

## Authentication

All protected endpoints require:

```
Authorization: Bearer <jwt_token>
```

Tokens are issued on register, login, or Google OAuth. Default expiry: 7 days. Use `/api/auth/refresh` to renew.

### Error Responses (All Endpoints)

| Status | Body | Meaning |
|--------|------|---------|
| 400 | `{ "error": "<validation message>" }` | Invalid request body (Joi validation) |
| 401 | `{ "error": "Authentication required" }` | Missing or invalid Bearer token |
| 403 | `{ "error": "Insufficient permissions" }` | Valid token but wrong role |
| 404 | `{ "error": "<resource> not found" }` | Resource does not exist |
| 409 | `{ "error": "<conflict message>" }` | Duplicate resource (email, slug, membership) |
| 500 | `{ "error": "Internal server error" }` | Unhandled server error |

---

## Health Check

### `GET /health`

**Auth:** Public

**Response:**

```json
{
  "status": "ok",
  "service": "bnco-connect-layer",
  "timestamp": "2026-03-04T12:00:00.000Z"
}
```

**curl:**

```bash
curl http://localhost:3001/health
```

---

## Auth

### `POST /api/auth/register`

Create a new account with email and password.

**Auth:** Public

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | 8-128 characters |
| `name` | string | Yes | 1-100 characters |
| `role` | string | No | `"athlete"` (default) or `"studio_admin"` |

**Response (201):**

```json
{
  "user": {
    "id": "uuid",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "role": "athlete",
    "created_at": "2026-03-04T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "needs_onboarding": true
}
```

**Errors:**

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Joi validation message | Missing/invalid fields |
| 409 | `"Email already registered"` | Duplicate email |

**curl:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "securepass123",
    "name": "Jane Doe",
    "role": "athlete"
  }'
```

---

### `POST /api/auth/google`

Sign in or sign up with a Google ID token.

**Auth:** Public

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `google_token` | string | Yes | Valid Google ID token |
| `role` | string | No | `"athlete"` (default) or `"studio_admin"` (only used for new accounts) |

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "jane@gmail.com",
    "name": "Jane Doe",
    "role": "athlete"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "needs_onboarding": true
}
```

**Errors:**

| Status | Error | Cause |
|--------|-------|-------|
| 401 | `"Invalid Google token"` | Token failed verification |

**curl:**

```bash
curl -X POST http://localhost:3001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "google_token": "eyJhbGciOiJSUzI1NiIs...",
    "role": "athlete"
  }'
```

---

### `POST /api/auth/login`

Login with email and password.

**Auth:** Public

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email |
| `password` | string | Yes | Non-empty |

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "role": "athlete"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "needs_onboarding": false
}
```

**Errors:**

| Status | Error | Cause |
|--------|-------|-------|
| 401 | `"Invalid email or password"` | Wrong credentials |
| 401 | `"This account uses Google sign-in"` | Google-only account, no password set |

**curl:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "securepass123"
  }'
```

---

### `POST /api/auth/refresh`

Refresh an existing JWT (even if expired).

**Auth:** Bearer token (can be expired)

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**

| Status | Error | Cause |
|--------|-------|-------|
| 401 | `"No token provided"` | Missing Authorization header |
| 401 | `"User not found"` | Token references deleted user |

**curl:**

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Users

### `GET /api/users/me`

Get the authenticated user's profile.

**Auth:** Required

**Response (200):**

```json
{
  "id": "uuid",
  "email": "jane@example.com",
  "name": "Jane Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "role": "athlete",
  "whoop_connected": true,
  "apple_health_connected": false,
  "created_at": "2026-03-04T12:00:00.000Z"
}
```

**curl:**

```bash
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer <token>"
```

---

### `PATCH /api/users/me`

Update profile fields.

**Auth:** Required

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | No | 1-100 characters |
| `avatar_url` | string | No | Valid URL |

At least one field must be provided.

**Response (200):**

```json
{
  "id": "uuid",
  "email": "jane@example.com",
  "name": "Jane Updated",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "role": "athlete"
}
```

**curl:**

```bash
curl -X PATCH http://localhost:3001/api/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Jane Updated" }'
```

---

### `POST /api/users/me/devices/whoop`

Initiate WHOOP OAuth connection. Returns the authorization URL to redirect the user to.

**Auth:** Required

**Response (200):**

```json
{
  "auth_url": "https://api.prod.whoop.com/oauth/oauth2/auth?client_id=...&redirect_uri=...&response_type=code&scope=read:profile%20read:workout&state=<user_id>"
}
```

**curl:**

```bash
curl -X POST http://localhost:3001/api/users/me/devices/whoop \
  -H "Authorization: Bearer <token>"
```

---

### `GET /api/users/me/devices/whoop/callback`

WHOOP OAuth callback. Exchanges authorization code for tokens and stores them. Redirects to frontend.

**Auth:** Public (state param contains user ID)

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `code` | string | Authorization code from WHOOP |
| `state` | string | User ID (passed as state in OAuth flow) |

**Behavior:** Redirects to `{FRONTEND_URL}/settings?whoop=connected`

---

### `POST /api/users/me/devices/apple`

Confirm Apple Watch / HealthKit connection from the iOS app.

**Auth:** Required

**Response (200):**

```json
{
  "connected": true
}
```

**curl:**

```bash
curl -X POST http://localhost:3001/api/users/me/devices/apple \
  -H "Authorization: Bearer <token>"
```

---

## Onboarding

### `POST /api/onboarding/complete`

Complete the athlete onboarding flow. Saves frequency, requests studio memberships, and attempts billing auto-verification.

**Auth:** Required

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `pilates_frequency` | string | Yes | Max 50 chars (e.g., `"3 days a week"`) |
| `studio_ids` | string[] | No | Array of studio UUIDs to request membership |
| `device_preferences` | object | No | `{ "whoop": bool, "apple_watch": bool }` |

**Response (200):**

```json
{
  "completed": true,
  "studios_requested": 2
}
```

**curl:**

```bash
curl -X POST http://localhost:3001/api/onboarding/complete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "pilates_frequency": "3 days a week",
    "studio_ids": ["uuid-1", "uuid-2"],
    "device_preferences": { "whoop": true, "apple_watch": false }
  }'
```

---

### `GET /api/onboarding/studios/search`

Search studios by name or city during onboarding.

**Auth:** Required

**Query Parameters:**

| Param | Type | Default | Constraints |
|-------|------|---------|-------------|
| `q` | string | `""` | Search query |
| `limit` | integer | 10 | Max 50 |

**Response (200):**

```json
{
  "studios": [
    {
      "id": "uuid",
      "name": "CorePower Pilates",
      "slug": "corepower-pilates",
      "city": "Cincinnati",
      "state": "OH",
      "logo_url": null,
      "member_count": 45
    }
  ]
}
```

**curl:**

```bash
curl "http://localhost:3001/api/onboarding/studios/search?q=pilates&limit=5" \
  -H "Authorization: Bearer <token>"
```

---

### `GET /api/onboarding/status`

Check if onboarding is complete and get current data.

**Auth:** Required

**Response (200) - Not completed:**

```json
{
  "completed": false,
  "data": null
}
```

**Response (200) - Completed:**

```json
{
  "completed": true,
  "data": {
    "user_id": "uuid",
    "pilates_frequency": "3 days a week",
    "completed_at": "2026-03-04T12:00:00.000Z",
    "studio_memberships": [
      {
        "studio_id": "uuid",
        "status": "active",
        "studio_name": "CorePower Pilates"
      }
    ]
  }
}
```

**curl:**

```bash
curl http://localhost:3001/api/onboarding/status \
  -H "Authorization: Bearer <token>"
```

---

## Workouts

### `POST /api/workouts`

Submit a workout session. Server calculates all scores (bnco, BTL, RES).

**Auth:** Required

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `studio_id` | string (UUID) | No | Null for home workouts |
| `recorded_at` | string (ISO 8601) | Yes | Workout timestamp |
| `duration_minutes` | integer | Yes | 1-300 |
| `source` | string | Yes | `"whoop"`, `"apple_watch"`, or `"both"` |
| `raw_muscular_load` | number | No | >= 0, from WHOOP |
| `raw_stability_variance` | number | No | 0-2, from Apple Watch Core Motion |
| `raw_respiratory_rate` | number | No | 0-60, breaths per minute |
| `raw_hrv` | number | No | >= 0, HRV in ms |

**Response (201):**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "studio_id": "uuid",
  "recorded_at": "2026-03-04T10:00:00.000Z",
  "duration_minutes": 50,
  "source": "both",
  "raw_muscular_load": 14.8,
  "raw_stability_variance": 0.25,
  "raw_respiratory_rate": 13.2,
  "raw_hrv": 62,
  "control_score": 88,
  "stillness_score": 82,
  "respiratory_score": 95,
  "bnco_score": 87,
  "created_at": "2026-03-04T12:01:00.000Z"
}
```

**Side effects:**
- Updates studio weekly goal (if `studio_id` and `raw_muscular_load` provided)
- Publishes real-time update via Redis for lobby SSE stream

**curl:**

```bash
curl -X POST http://localhost:3001/api/workouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studio_id": "uuid",
    "recorded_at": "2026-03-04T10:00:00.000Z",
    "duration_minutes": 50,
    "source": "both",
    "raw_muscular_load": 14.8,
    "raw_stability_variance": 0.25,
    "raw_respiratory_rate": 13.2,
    "raw_hrv": 62
  }'
```

---

### `GET /api/workouts/me`

Get the authenticated user's workout history (paginated).

**Auth:** Required

**Query Parameters:**

| Param | Type | Default | Constraints |
|-------|------|---------|-------------|
| `limit` | integer | 20 | Max 100 |
| `offset` | integer | 0 | Pagination offset |

**Response (200):**

```json
{
  "workouts": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "studio_id": "uuid",
      "recorded_at": "2026-03-04T10:00:00.000Z",
      "duration_minutes": 50,
      "source": "both",
      "control_score": 88,
      "stillness_score": 82,
      "respiratory_score": 95,
      "bnco_score": 87,
      "created_at": "2026-03-04T12:01:00.000Z"
    }
  ],
  "limit": 20,
  "offset": 0
}
```

**curl:**

```bash
curl "http://localhost:3001/api/workouts/me?limit=10&offset=0" \
  -H "Authorization: Bearer <token>"
```

---

### `GET /api/workouts/me/stats`

Get aggregated workout statistics for the authenticated user.

**Auth:** Required

**Query Parameters:**

| Param | Type | Default | Options |
|-------|------|---------|---------|
| `period` | string | `"month"` | `"week"`, `"month"`, `"all"` |

**Response (200):**

```json
{
  "stats": {
    "total_workouts": "24",
    "avg_bnco_score": "82",
    "avg_control": "85",
    "avg_stillness": "78",
    "avg_respiratory": "88",
    "peak_bnco_score": 96,
    "total_minutes": "1200"
  },
  "trend": [
    { "recorded_at": "2026-02-25T10:00:00.000Z", "bnco_score": 79 },
    { "recorded_at": "2026-02-27T10:00:00.000Z", "bnco_score": 84 },
    { "recorded_at": "2026-03-01T10:00:00.000Z", "bnco_score": 87 }
  ],
  "period": "month"
}
```

**curl:**

```bash
curl "http://localhost:3001/api/workouts/me/stats?period=week" \
  -H "Authorization: Bearer <token>"
```

---

## Studios

### `POST /api/studios`

Create a new studio. The authenticated user becomes the owner and is auto-joined as an active member.

**Auth:** Required

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | 1-100 characters |
| `slug` | string | Yes | 1-100 chars, lowercase alphanumeric + hyphens only |
| `city` | string | No | Max 100 characters |
| `state` | string | No | Max 50 characters |
| `accent_color` | string | No | Hex color code, default `"#4ade80"` |

**Response (201):**

```json
{
  "id": "uuid",
  "name": "CorePower Pilates",
  "slug": "corepower-pilates",
  "city": "Cincinnati",
  "state": "OH",
  "owner_id": "uuid",
  "accent_color": "#4ade80",
  "logo_url": null,
  "lobby_pin": null,
  "created_at": "2026-03-04T12:00:00.000Z",
  "updated_at": "2026-03-04T12:00:00.000Z"
}
```

**Side effects:**
- Updates user role to `studio_admin`
- Creates active membership for owner

**Errors:**

| Status | Error | Cause |
|--------|-------|-------|
| 409 | `"Studio slug already taken"` | Duplicate slug |

**curl:**

```bash
curl -X POST http://localhost:3001/api/studios \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CorePower Pilates",
    "slug": "corepower-pilates",
    "city": "Cincinnati",
    "state": "OH"
  }'
```

---

### `GET /api/studios/:id`

Get studio information (public).

**Auth:** Public

**Response (200):**

```json
{
  "id": "uuid",
  "name": "CorePower Pilates",
  "slug": "corepower-pilates",
  "city": "Cincinnati",
  "state": "OH",
  "owner_id": "uuid",
  "owner_name": "Studio Admin",
  "accent_color": "#4ade80",
  "logo_url": null,
  "member_count": "45",
  "created_at": "2026-03-04T12:00:00.000Z"
}
```

**curl:**

```bash
curl http://localhost:3001/api/studios/<studio_id>
```

---

### `POST /api/studios/:id/join`

Request to join a studio. Creates a pending membership.

**Auth:** Required

**Response (201):**

```json
{
  "joined": true
}
```

**Errors:**

| Status | Error | Cause |
|--------|-------|-------|
| 404 | `"Studio not found"` | Invalid studio ID |
| 409 | `"Already a member"` | Membership already exists (any status) |

**curl:**

```bash
curl -X POST http://localhost:3001/api/studios/<studio_id>/join \
  -H "Authorization: Bearer <token>"
```

---

### `GET /api/studios/:id/leaderboard`

Get the Precision Leaderboard for a studio. Only shows members who opted in.

**Auth:** Public

**Query Parameters:**

| Param | Type | Default | Options |
|-------|------|---------|---------|
| `period` | string | `"week"` | `"week"`, `"month"` |

**Response (200):**

```json
{
  "leaderboard": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "avg_bnco_score": "92",
      "avg_stillness": "89",
      "session_count": "5"
    }
  ],
  "period": "week"
}
```

**curl:**

```bash
curl "http://localhost:3001/api/studios/<studio_id>/leaderboard?period=month"
```

---

### `GET /api/studios/:id/goal`

Get the current weekly tension goal and progress.

**Auth:** Public

**Response (200) - Goal exists:**

```json
{
  "goal": {
    "id": "uuid",
    "studio_id": "uuid",
    "week_start": "2026-03-03",
    "target_load_units": 30000,
    "current_load_units": 18750,
    "created_at": "2026-03-03T00:00:00.000Z",
    "progress_percent": 63
  }
}
```

**Response (200) - No goal set:**

```json
{
  "goal": null
}
```

**curl:**

```bash
curl http://localhost:3001/api/studios/<studio_id>/goal
```

---

### `POST /api/studios/:id/goal`

Set or update the weekly tension goal. Studio owner only.

**Auth:** Required (studio owner)

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `target_load_units` | integer | Yes | Must be >= 1 |

**Response (200):**

```json
{
  "id": "uuid",
  "studio_id": "uuid",
  "week_start": "2026-03-03",
  "target_load_units": 30000,
  "current_load_units": 0,
  "created_at": "2026-03-03T00:00:00.000Z"
}
```

**Errors:**

| Status | Error | Cause |
|--------|-------|-------|
| 403 | `"Only the studio owner can set goals"` | Non-owner attempted |

**curl:**

```bash
curl -X POST http://localhost:3001/api/studios/<studio_id>/goal \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "target_load_units": 30000 }'
```

---

### `GET /api/studios/:id/members`

List studio members with scores. Studio owner only.

**Auth:** Required (studio owner)

**Response (200):**

```json
{
  "members": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "avatar_url": null,
      "joined_at": "2026-02-15T12:00:00.000Z",
      "show_on_leaderboard": true,
      "avg_score_30d": "85"
    }
  ]
}
```

**curl:**

```bash
curl http://localhost:3001/api/studios/<studio_id>/members \
  -H "Authorization: Bearer <token>"
```

---

### `GET /api/studios/:id/at-risk`

Identify members with declining engagement or scores. Studio owner only.

Triggers when: member has no workout in 14+ days, OR their 7-day avg score dropped below 80% of their 30-day avg.

**Auth:** Required (studio owner)

**Response (200):**

```json
{
  "at_risk": [
    {
      "id": "uuid",
      "name": "John Smith",
      "email": "john@example.com",
      "avg_score_7d": "62",
      "avg_score_30d": "81",
      "last_workout": "2026-02-18T10:00:00.000Z"
    }
  ]
}
```

**curl:**

```bash
curl http://localhost:3001/api/studios/<studio_id>/at-risk \
  -H "Authorization: Bearer <token>"
```

---

## Memberships

Membership routes are mounted under `/api/studios` alongside studio routes.

### `GET /api/studios/:studioId/requests`

List pending membership requests. Studio owner only.

**Auth:** Required (studio owner)

**Response (200):**

```json
{
  "requests": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "status": "pending",
      "requested_at": "2026-03-04T12:00:00.000Z",
      "name": "New Athlete",
      "email": "athlete@example.com",
      "avatar_url": null
    }
  ]
}
```

**curl:**

```bash
curl http://localhost:3001/api/studios/<studio_id>/requests \
  -H "Authorization: Bearer <token>"
```

---

### `POST /api/studios/:studioId/requests/:membershipId/approve`

Approve a pending membership request. Studio owner only.

**Auth:** Required (studio owner)

**Response (200):**

```json
{
  "approved": true,
  "membership": {
    "id": "uuid",
    "studio_id": "uuid",
    "user_id": "uuid",
    "status": "active",
    "verified_via": "manual",
    "approved_at": "2026-03-04T12:05:00.000Z"
  }
}
```

**curl:**

```bash
curl -X POST http://localhost:3001/api/studios/<studio_id>/requests/<membership_id>/approve \
  -H "Authorization: Bearer <token>"
```

---

### `POST /api/studios/:studioId/requests/:membershipId/deny`

Deny a pending membership request. Studio owner only.

**Auth:** Required (studio owner)

**Response (200):**

```json
{
  "denied": true
}
```

**curl:**

```bash
curl -X POST http://localhost:3001/api/studios/<studio_id>/requests/<membership_id>/deny \
  -H "Authorization: Bearer <token>"
```

---

### `POST /api/studios/:studioId/billing`

Configure billing integration for auto-member verification. Studio owner only.

**Auth:** Required (studio owner)

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `provider` | string | Yes | `"mindbody"`, `"mariana_tek"`, `"stripe"`, or `"manual"` |
| `api_key` | string | No | Provider API key (encrypted at rest in production) |
| `api_endpoint` | string | No | Custom API endpoint URL |

**Response (200):**

```json
{
  "id": "uuid",
  "studio_id": "uuid",
  "provider": "stripe",
  "active": true
}
```

**curl:**

```bash
curl -X POST http://localhost:3001/api/studios/<studio_id>/billing \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "stripe",
    "api_key": "sk_live_...",
    "api_endpoint": null
  }'
```

---

### `GET /api/studios/:studioId/members` (Membership route)

List members filtered by status. Studio owner only.

**Auth:** Required (studio owner)

**Query Parameters:**

| Param | Type | Default | Options |
|-------|------|---------|---------|
| `status` | string | `"active"` | `"pending"`, `"active"`, `"denied"`, `"expired"` |

**Response (200):**

```json
{
  "members": [
    {
      "membership_id": "uuid",
      "status": "active",
      "verified_via": "billing_auto",
      "requested_at": "2026-02-15T12:00:00.000Z",
      "approved_at": "2026-02-15T12:00:01.000Z",
      "user_id": "uuid",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "avatar_url": null,
      "avg_score_30d": "85",
      "sessions_30d": "12"
    }
  ],
  "status": "active"
}
```

**curl:**

```bash
curl "http://localhost:3001/api/studios/<studio_id>/members?status=pending" \
  -H "Authorization: Bearer <token>"
```

---

## Challenges

### `POST /api/challenges`

Create a studio-to-studio challenge. Requires the caller to own a studio.

**Auth:** Required (must own a studio)

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `defender_studio_id` | string (UUID) | Yes | Target studio to challenge |
| `start_date` | string (date) | Yes | ISO date |
| `end_date` | string (date) | Yes | ISO date, must be after start |
| `metric` | string | No | `"avg_stability"` (default) or `"avg_bnco_score"` |

**Response (201):**

```json
{
  "id": "uuid",
  "challenger_studio_id": "uuid",
  "defender_studio_id": "uuid",
  "start_date": "2026-03-10",
  "end_date": "2026-03-24",
  "metric": "avg_stability",
  "status": "pending",
  "challenger_avg": null,
  "defender_avg": null,
  "winner_studio_id": null,
  "created_at": "2026-03-04T12:00:00.000Z"
}
```

**Errors:**

| Status | Error | Cause |
|--------|-------|-------|
| 403 | `"You must own a studio to create challenges"` | User has no studio |
| 404 | `"Defending studio not found"` | Invalid defender_studio_id |
| 400 | `"Cannot challenge your own studio"` | Challenger = Defender |

**curl:**

```bash
curl -X POST http://localhost:3001/api/challenges \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "defender_studio_id": "uuid",
    "start_date": "2026-03-10",
    "end_date": "2026-03-24",
    "metric": "avg_stability"
  }'
```

---

### `GET /api/challenges/:id`

Get challenge details with studio names.

**Auth:** Public

**Response (200):**

```json
{
  "id": "uuid",
  "challenger_studio_id": "uuid",
  "defender_studio_id": "uuid",
  "start_date": "2026-03-10",
  "end_date": "2026-03-24",
  "metric": "avg_stability",
  "status": "active",
  "challenger_avg": "82.5",
  "defender_avg": "79.3",
  "winner_studio_id": null,
  "challenger_name": "CorePower Pilates",
  "challenger_slug": "corepower-pilates",
  "defender_name": "FlexCore Studio",
  "defender_slug": "flexcore-studio",
  "created_at": "2026-03-04T12:00:00.000Z"
}
```

**curl:**

```bash
curl http://localhost:3001/api/challenges/<challenge_id>
```

---

### `PATCH /api/challenges/:id/accept`

Accept a pending challenge. Only the defending studio's owner can accept.

**Auth:** Required (defender studio owner)

**Response (200):**

```json
{
  "id": "uuid",
  "status": "active",
  "challenger_studio_id": "uuid",
  "defender_studio_id": "uuid",
  "start_date": "2026-03-10",
  "end_date": "2026-03-24",
  "metric": "avg_stability"
}
```

**Errors:**

| Status | Error | Cause |
|--------|-------|-------|
| 403 | `"Only the defending studio owner can accept"` | Wrong user |
| 400 | `"Challenge cannot be accepted (not pending)"` | Already active/completed/declined |

**curl:**

```bash
curl -X PATCH http://localhost:3001/api/challenges/<challenge_id>/accept \
  -H "Authorization: Bearer <token>"
```

---

## Lobby Feed

### `GET /api/lobby/:slug`

Get the full lobby feed data for a studio's TV display. Rate-limited.

**Auth:** Public

**Response (200):**

```json
{
  "studio": {
    "name": "CorePower Pilates",
    "accent_color": "#4ade80",
    "logo_url": null
  },
  "weekly_goal": {
    "target": 30000,
    "current": 18750,
    "progress_percent": 63
  },
  "athlete_of_the_week": {
    "name": "Jane Doe",
    "avatar_url": null,
    "avg_score": "92",
    "sessions": "5"
  },
  "leaderboard": [
    { "name": "Jane Doe", "avatar_url": null, "avg_score": "92" },
    { "name": "John Smith", "avatar_url": null, "avg_score": "88" }
  ],
  "active_challenges": [
    {
      "id": "uuid",
      "challenger_name": "CorePower Pilates",
      "defender_name": "FlexCore Studio",
      "status": "active",
      "start_date": "2026-03-10",
      "end_date": "2026-03-24"
    }
  ],
  "recent_highlights": [
    { "name": "Jane Doe", "bnco_score": 96, "recorded_at": "2026-03-04T10:00:00.000Z" }
  ],
  "updated_at": "2026-03-04T12:00:00.000Z"
}
```

**curl:**

```bash
curl http://localhost:3001/api/lobby/corepower-pilates
```

---

### `GET /api/lobby/:slug/stream`

Server-Sent Events (SSE) stream for real-time lobby updates. Connect from the TV display for live data.

**Auth:** Public

**Headers:**

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Event format:**

```
data: {"type":"workout","user_id":"uuid","bnco_score":87}
```

**Heartbeat:** Every 30 seconds:

```
: heartbeat
```

**curl:**

```bash
curl -N http://localhost:3001/api/lobby/corepower-pilates/stream
```

---

## Webhooks

### `POST /api/webhooks/whoop`

Receives WHOOP workout completion webhooks. Processes Pilates workouts into bnco scores.

**Auth:** WHOOP webhook signature (HMAC-SHA256)

**Headers:**

| Header | Description |
|--------|-------------|
| `x-whoop-signature` | HMAC-SHA256 of request body using `WHOOP_WEBHOOK_SECRET` |

**Request Body (from WHOOP):**

```json
{
  "user_id": "whoop-user-id",
  "event_type": "workout.completed",
  "data": {
    "sport_id": 63,
    "muscular_strain": 14.8,
    "respiratory_rate": 13.2,
    "hrv_impact": 4.5,
    "duration_seconds": 3000
  }
}
```

**Response (200) - Processed:**

```json
{
  "processed": true,
  "workout_id": "uuid"
}
```

**Response (200) - Ignored:**

```json
{
  "ignored": true,
  "reason": "not a workout event"
}
```

**Side effects:**
- Creates workout_session with calculated scores
- Updates studio weekly goal
- Publishes real-time lobby update via Redis

**curl (testing):**

```bash
curl -X POST http://localhost:3001/api/webhooks/whoop \
  -H "Content-Type: application/json" \
  -H "x-whoop-signature: <hmac-sha256-hex>" \
  -d '{
    "user_id": "whoop-123",
    "event_type": "workout.completed",
    "data": {
      "sport_id": 63,
      "muscular_strain": 14.8,
      "respiratory_rate": 13.2,
      "hrv_impact": 4.5,
      "duration_seconds": 3000
    }
  }'
```

---

## Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Auth (register/login) | 10 requests | per minute per IP |
| General API (authenticated) | 100 requests | per minute per user |
| Lobby feed (public) | 30 requests | per minute per IP |
| Lobby SSE stream | 1 connection | per studio slug per IP |
| Webhooks (WHOOP) | 60 requests | per minute per source |

Rate limiting is handled via middleware using sliding window counters in Redis. Exceeding the limit returns `429 Too Many Requests`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | No | Redis URL (default: `redis://localhost:6379`) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `"7d"`) |
| `WHOOP_CLIENT_ID` | Yes | WHOOP Developer App client ID |
| `WHOOP_CLIENT_SECRET` | Yes | WHOOP Developer App client secret |
| `WHOOP_REDIRECT_URI` | Yes | OAuth callback URL |
| `WHOOP_WEBHOOK_SECRET` | No | Secret for verifying WHOOP webhook signatures |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `PORT` | No | Server port (default: `3001`) |
| `NODE_ENV` | No | `"development"` or `"production"` |
| `FRONTEND_URL` | No | Frontend URL for CORS and redirects (default: `http://localhost:3000`) |
