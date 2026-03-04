# Studio API — Dashboard & Mission Endpoints

> **Purpose:** API specification for studio owners to manage their CompeteHealth dashboard, create missions, and control leaderboard settings.

---

## 1 · Authentication

All studio endpoints require a valid `Authorization: Bearer {studio_token}` header. Studio tokens are issued via OAuth 2.0 after the studio owner's identity is verified against their registered business profile.

| Header | Value |
|---|---|
| `Authorization` | `Bearer {studio_token}` |
| `Content-Type` | `application/json` |

---

## 2 · Studio Profile

### 2.1 Get Studio Profile

```
GET /api/studios/{studio_id}
```

**Response:**

```json
{
  "studio_id":     "uuid",
  "name":          "CorePower Pilates",
  "city":          "Cincinnati",
  "state":         "OH",
  "country":       "US",
  "member_count":  248,
  "avg_res":       67.3,
  "city_rank":     3,
  "created_at":    "ISO-8601"
}
```

### 2.2 Update Studio Profile

```
PATCH /api/studios/{studio_id}
```

**Body:**

```json
{
  "name": "CorePower Pilates — Hyde Park"
}
```

---

## 3 · Mission CRUD

### 3.1 Create Mission

```
POST /api/studios/{studio_id}/missions
```

**Body:**

```json
{
  "name":       "February Burn Challenge",
  "metric":     "calories",
  "target":     5000,
  "start_date": "2026-02-01",
  "end_date":   "2026-02-28"
}
```

**Allowed `metric` values:** `strain`, `calories`, `steps`, `recovery`, `classes`

**Response:** `201 Created`

```json
{
  "mission_id":  "uuid",
  "studio_id":   "uuid",
  "name":        "February Burn Challenge",
  "metric":      "calories",
  "target":      5000,
  "start_date":  "2026-02-01",
  "end_date":    "2026-02-28",
  "status":      "active",
  "created_at":  "ISO-8601"
}
```

### 3.2 List Missions

```
GET /api/studios/{studio_id}/missions?status=active
```

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `status` | `active \| completed \| all` | `all` | Filter by mission status |
| `limit` | int | 20 | Max results |
| `offset` | int | 0 | Pagination offset |

### 3.3 Get Mission Progress

```
GET /api/studios/{studio_id}/missions/{mission_id}
```

**Response:**

```json
{
  "mission_id":       "uuid",
  "name":             "February Burn Challenge",
  "metric":           "calories",
  "target":           5000,
  "participant_count": 142,
  "avg_progress":     68.4,
  "milestones": {
    "25_pct": { "completed": 128, "total": 142 },
    "50_pct": { "completed": 97,  "total": 142 },
    "75_pct": { "completed": 54,  "total": 142 },
    "100_pct": { "completed": 12, "total": 142 }
  },
  "top_performers": [
    { "user_id": "uuid", "display_name": "Jake R.", "progress": 100 },
    { "user_id": "uuid", "display_name": "Maya K.", "progress": 94 }
  ]
}
```

### 3.4 Update Mission

```
PATCH /api/studios/{studio_id}/missions/{mission_id}
```

**Body (any fields):**

```json
{
  "target": 6000,
  "end_date": "2026-03-15"
}
```

### 3.5 Delete Mission

```
DELETE /api/studios/{studio_id}/missions/{mission_id}
```

Returns `204 No Content`. Active progress is archived but no longer visible.

---

## 4 · Member Analytics

### 4.1 Member List

```
GET /api/studios/{studio_id}/members
```

**Response:**

```json
{
  "members": [
    {
      "user_id":      "uuid",
      "display_name": "Sarah M.",
      "res_score":    74.6,
      "level":        12,
      "streak_days":  5,
      "last_checkin":  "ISO-8601"
    }
  ],
  "total": 248
}
```

> **Privacy:** Only `display_name`, `res_score`, `level`, `streak_days`, and `last_checkin` are exposed. No raw health metrics.

### 4.2 Studio Analytics Summary

```
GET /api/studios/{studio_id}/analytics
```

**Response:**

```json
{
  "daily_avg_res": [
    { "date": "2026-02-25", "avg_res": 64.2, "active_members": 87 },
    { "date": "2026-02-26", "avg_res": 67.3, "active_members": 92 }
  ],
  "city_ranking": {
    "rank": 3,
    "total_studios": 12,
    "top_studios": [
      { "name": "Burn Pilates Studio", "avg_res": 78.4 },
      { "name": "FlexCore Cincinnati", "avg_res": 74.1 },
      { "name": "CorePower Pilates",   "avg_res": 71.8 }
    ]
  },
  "member_growth": {
    "last_7_days": +8,
    "last_30_days": +34
  }
}
```

---

## 5 · System Controls

### 5.1 Get Current Leaderboard Weights

```
GET /api/studios/{studio_id}/controls
```

**Response:**

```json
{
  "weights": {
    "strain":   0.35,
    "hr":       0.25,
    "steps":    0.20,
    "recovery": 0.20
  },
  "disabled_metrics": []
}
```

### 5.2 Update Leaderboard Weights

```
PUT /api/studios/{studio_id}/controls
```

**Body:**

```json
{
  "enabled_metrics": ["recovery"],
  "note": "This week: Recovery focus only"
}
```

**Behavior:**

1. Only listed metrics are active; unlisted ones are disabled.
2. Weights are automatically re-normalized among active metrics.
3. A `note` field (optional) is displayed on the studio's leaderboard header.
4. Changes take effect on the next leaderboard refresh cycle (≤60 s for studio tier).

**Response:**

```json
{
  "weights": {
    "strain":   0.00,
    "hr":       0.00,
    "steps":    0.00,
    "recovery": 1.00
  },
  "disabled_metrics": ["strain", "hr", "steps"],
  "note": "This week: Recovery focus only"
}
```

---

## 6 · Webhooks (Studio → External)

Studios can register outbound webhooks to receive events:

```
POST /api/studios/{studio_id}/webhooks
```

**Body:**

```json
{
  "url":    "https://studio-crm.example.com/hooks/competehealth",
  "events": ["mission.completed", "member.leveled_up", "streak.broken"]
}
```

**Available events:**

| Event | Payload |
|---|---|
| `mission.completed` | `{ mission_id, user_id, completed_at }` |
| `member.leveled_up` | `{ user_id, new_level, new_title }` |
| `streak.broken` | `{ user_id, streak_days, broken_at }` |
| `city_rank.changed` | `{ old_rank, new_rank }` |

All webhook payloads include `studio_id`, `event`, `timestamp`, and a `signature` header (HMAC-SHA256) for verification.
