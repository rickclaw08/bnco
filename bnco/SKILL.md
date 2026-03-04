---
name: CompeteHealth
description: Competitive social health skill — turns biometric data from wearables into privacy-first, geo-aware leaderboards with gamification mechanics.
---

# CompeteHealth

> **One-liner:** Bridge the gap between wearable data and social competition by ranking users fairly across classes, studios, cities, states, countries, and the globe.

---

## 1 · Data Ingestion

### 1.1 Unified API Layer

Use **Terra** (preferred) or **Vital** as a single integration point to normalize data from multiple wearable platforms.

| Provider | Supported Fields |
|---|---|
| **Whoop** | Recovery Score, Strain, HRV, Resting HR, Sleep Performance |
| **Apple Health** | Steps, Active Calories, Heart Rate (avg/max), Workouts |
| **Garmin** | Body Battery, Steps, Stress, Heart Rate, Training Load |

### 1.2 Ingestion Pipeline

```
┌──────────────┐    webhook / poll     ┌──────────────────┐
│  Terra API   │ ─────────────────────▶│  Ingestion Worker │
└──────────────┘   (5-min cadence)     └────────┬─────────┘
                                                │
                          ┌─────────────────────┼──────────────────────┐
                          ▼                     ▼                      ▼
                   ┌─────────────┐    ┌──────────────────┐    ┌──────────────┐
                   │  Raw Store  │    │  Normalization   │    │  Dead-Letter │
                   │  (Postgres) │    │  Service          │    │  Queue       │
                   └─────────────┘    └────────┬─────────┘    └──────────────┘
                                               ▼
                                     ┌──────────────────┐
                                     │  Score Engine     │
                                     └──────────────────┘
```

**Key rules:**

1. **Idempotent writes** — each data point keyed by `(user_id, source, metric, timestamp)`. Duplicate webhooks are safe.
2. **Dead-letter queue** — any ingestion failure is retried 3× with exponential back-off, then parked for manual review.
3. **Polling fallback** — if a provider's webhook is delayed >15 min, a scheduled poller backfills the gap.

### 1.3 Canonical Data Model

```json
{
  "user_id":    "uuid",
  "source":     "whoop | apple_health | garmin",
  "timestamp":  "ISO-8601",
  "metrics": {
    "strain":       0.0,   // 0-21 (Whoop scale, mapped from others)
    "recovery":     0.0,   // 0-100 %
    "steps":        0,     // daily count
    "hr_avg":       0,     // bpm
    "hr_max":       0,     // bpm
    "resting_hr":   0,     // bpm
    "hrv":          0.0,   // ms (RMSSD)
    "active_cal":   0      // kcal
  }
}
```

Fields not available from a given provider are set to `null` and excluded from scoring (see [scoring_math.md](references/scoring_math.md) §2.4 — Missing Data Handling).

---

## 2 · Score Normalization — The Equalizer

> Full mathematical specification → **[references/scoring_math.md](references/scoring_math.md)**

### 2.1 Design Goal

Raw leaderboards punish beginners and reward genetic outliers. The **Equalizer** produces a **Relative Effort Score (RES)** that measures *how hard you worked relative to your own capacity*, not absolute output.

### 2.2 High-Level Formula

```
RES = w₁·ƒ_strain(strain, baseline_strain)
    + w₂·ƒ_hr(%maxHR, resting_hr)
    + w₃·ƒ_steps(steps, baseline_steps)
    + w₄·ƒ_recovery(recovery, baseline_recovery)
```

- Each sub-function produces a **0–100** normalized score.
- `baseline_*` = 7-day rolling average for the individual user.
- Weights default to `w = [0.35, 0.25, 0.20, 0.20]`, tunable per leaderboard type.

### 2.3 Age-Band & Fitness Normalization

| Band | Max HR Estimate | Recovery Ceiling |
|---|---|---|
| 18–29 | `220 - age` | 100 |
| 30–39 | `207 - 0.7·age` | 98 |
| 40–49 | `207 - 0.7·age` | 95 |
| 50–59 | `207 - 0.7·age` | 90 |
| 60+ | `207 - 0.7·age` | 85 |

These ceilings feed into the sub-functions so a 55-year-old hitting 88% of *their* max HR scores the same as a 25-year-old hitting 88% of *theirs*.

---

## 3 · Leaderboard Engine

### 3.1 Tiered Architecture

| Tier | Scope | Store | Update Frequency |
|---|---|---|---|
| **Class** | Single workout session | Redis Sorted Set | Real-time (≤2 s) |
| **Studio** | All users checked into a gym/studio | Redis Sorted Set | Real-time (≤5 s) |
| **City** | Users in the same city polygon | PostgreSQL + PostGIS | Every 60 s (batch) |
| **State** | Users in the same state polygon | PostgreSQL + PostGIS | Every 5 min (batch) |
| **Country** | National ranking | PostgreSQL | Every 15 min (batch) |
| **Global** | All users | PostgreSQL | Every 15 min (batch) |

> Geo-spatial boundary logic → **[references/geo_logic.md](references/geo_logic.md)**

### 3.2 Redis Data Structures (Class & Studio)

```
ZADD  leaderboard:class:{class_id}  {RES}  {user_id}
ZADD  leaderboard:studio:{studio_id}  {RES}  {user_id}
```

- `ZREVRANGE` for top-N retrieval — O(log N + M).
- TTL on class keys = class duration + 30 min buffer (auto-cleanup).
- Pub/Sub channel `leaderboard:updates:{scope_id}` pushes rank-change events to connected clients.

### 3.3 PostgreSQL Schema (Geo-Tiers)

```sql
CREATE TABLE geo_scores (
    user_id       UUID PRIMARY KEY,
    res           NUMERIC(6,2)    NOT NULL,
    location      GEOGRAPHY(POINT, 4326),
    city_id       INT REFERENCES cities(id),
    state_id      INT REFERENCES states(id),
    country_code  CHAR(2),
    updated_at    TIMESTAMPTZ     DEFAULT now()
);

CREATE INDEX idx_geo_scores_city  ON geo_scores (city_id, res DESC);
CREATE INDEX idx_geo_scores_state ON geo_scores (state_id, res DESC);
CREATE INDEX idx_geo_scores_country ON geo_scores (country_code, res DESC);
CREATE INDEX idx_geo_scores_global  ON geo_scores (res DESC);
```

Batch job: `REFRESH MATERIALIZED VIEW CONCURRENTLY city_rankings;` etc.

### 3.4 Update Pipeline

```
Score Engine    ──▶  Redis (class/studio)   ──▶  WebSocket push
    │
    └──▶  PostgreSQL (geo upsert)  ──▶  Materialized View refresh  ──▶  REST API
```

All writes are **idempotent** (`ON CONFLICT (user_id) DO UPDATE`). Horizontal scaling achieved by partitioning Redis by `class_id` and Postgres by `country_code`.

---

## 4 · Dynamic Scoping

### 4.1 GPS-Based Auto-Placement

On app open (or every 6 hours in background):

1. Capture coarse-grained location (city-level only — no precise coordinates stored).
2. Run PostGIS `ST_Contains` against city/state polygons (see [geo_logic.md](references/geo_logic.md) §2).
3. Store `(city_id, state_id, country_code)` on the user record.

### 4.2 Studio & Class Check-In

```
POST /api/checkin
{
  "studio_id":  "uuid",
  "class_id":   "uuid",       // optional — null if open gym
  "started_at": "ISO-8601"
}
```

- Links the user to a **Studio** leaderboard immediately.
- If `class_id` is provided, also links to the **Class** leaderboard.

### 4.3 Class Mode — Live Leaderboard

| Phase | Trigger | Action |
|---|---|---|
| **Activation** | Class `start_time` reached | Create Redis sorted set, begin ingesting RES updates |
| **Live** | During class window | Push rank changes via WebSocket every 2 s |
| **Cool-down** | Class `end_time` + 5 min | Freeze leaderboard, calculate final standings |
| **Archive** | Cool-down complete | Snapshot to Postgres `class_results`, expire Redis key |

---

## 5 · Privacy Layer

### 5.1 Visible vs. Private Data

| Data | Visible to Others? |
|---|---|
| Username / Display Name | ✅ |
| Competition Score (RES) | ✅ |
| Rank & Percentile | ✅ |
| Badges & Streaks | ✅ |
| City (name only) | ✅ |
| Exact BPM / HR data | ❌ |
| Weight / Body Composition | ❌ |
| HRV / Resting HR | ❌ |
| Precise GPS coordinates | ❌ |
| Recovery % (raw) | ❌ |
| Age | ❌ |

### 5.2 Implementation Rules

1. **API responses** for leaderboards contain only: `user_id`, `display_name`, `res_score`, `rank`, `badges[]`.
2. **Database column-level encryption** (AES-256-GCM) on `resting_hr`, `hrv`, `weight`.
3. **Row-level security** (Postgres RLS) ensures a user can only SELECT their own raw metrics.
4. Score normalization runs server-side; the client never receives intermediate health values.

---

## 6 · Vibe Add-ons

### 6.1 City Boss 🏙️

Every day at 00:00 UTC:

1. Compute `city_avg_res` = mean RES across all active users in the city for the previous 24 h.
2. Any user whose RES exceeds the city average earns a **"Beat the City"** status + a **+5 bonus** applied to their next leaderboard snapshot.
3. The single user with the highest RES in the city is crowned **City Boss** for the day (badge + profile flair).

```sql
-- City Boss query
SELECT user_id, res
FROM   geo_scores
WHERE  city_id = :city_id
  AND  updated_at >= now() - INTERVAL '24 hours'
ORDER  BY res DESC
LIMIT  1;
```

### 6.2 Ghost Racing 👻

1. At the end of each day, persist the top performer's per-minute RES curve for each studio: `ghost_traces(studio_id, date, minute_offset, res_value)`.
2. During the next day's class, stream the ghost's time-series to the client so users see a **phantom racer** on their live leaderboard.
3. If the user's running RES exceeds the ghost's value at the same `minute_offset`, they earn a **"Ghost Slayer"** badge fragment. Collect 5 fragments → permanent badge.

### 6.3 Vibe Streaks 🔥

| Streak | Condition | Reward |
|---|---|---|
| **Bronze Streak** | Top 50% for 3 consecutive days | +2 RES bonus per day |
| **Silver Streak** | Top 25% for 7 consecutive days | +5 RES bonus per day, silver profile ring |
| **Gold Streak** | Top 10% for 14 consecutive days | +10 RES bonus per day, gold profile ring |
| **Diamond Streak** | Top 5% for 30 consecutive days | Permanent "Diamond" badge, leaderboard highlight |

Streaks are evaluated at midnight local time. A missed day resets the counter to zero.

---

## 7 · Concurrency & Modularity

### 7.1 Service Boundaries

```
┌──────────────────────────────────────────────────────────────┐
│                        API Gateway                           │
└──────┬──────────┬──────────┬──────────┬──────────┬───────────┘
       │          │          │          │          │
  ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐
  │Ingest  │ │Score   │ │Board   │ │Geo     │ │Add-on  │
  │Service │ │Engine  │ │Service │ │Service │ │Service │
  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

Each service is independently deployable and communicates via a message bus (NATS / Redis Streams).

### 7.2 High-Concurrency Patterns

| Pattern | Where | Why |
|---|---|---|
| **Optimistic locking** | Score Engine | Prevent lost updates when two webhooks arrive for the same user within the same second |
| **Write-behind cache** | Board Service | Batch Redis → Postgres geo-score syncs to reduce Postgres write load |
| **Fan-out on write** | Add-on Service | City Boss / Streak evaluation runs asynchronously after each score commit |
| **Connection pooling** | All services | PgBouncer (transaction mode) caps connections at 100 per service |
| **Idempotency keys** | Ingest Service | Dedup webhooks using `(source, metric, timestamp)` composite key |

### 7.3 Scaling Targets

| Metric | Target |
|---|---|
| Concurrent class leaderboards | 10,000 |
| Leaderboard rank query p99 | < 50 ms |
| Score ingestion throughput | 50,000 events/sec |
| Geo-tier refresh latency | < 5 s for city, < 30 s for global |

---

## 8 · Gamification & Leveling

> Full XP math → **[references/scoring_math.md](references/scoring_math.md) §7–8**

### 8.1 XP System

Users earn **Experience Points (XP)** for activity:

| Action | Base XP | Notes |
|---|---|---|
| Sync a workout | 10 | Per session |
| Complete a class | 25 | Studio check-in required |
| Beat personal RES baseline | 15 | Only once per day |
| Beat the City average | 10 | Daily evaluation |
| Complete a Studio Mission milestone | 20 | Per 25% threshold |

### 8.2 The Perfect Week

Sync workouts or attend classes **7 consecutive days** (midnight-to-midnight local time) → **+20 XP bonus** applied immediately at the end of Day 7.

### 8.3 Vibe Streak 2x Multiplier

| Condition | Effect |
|---|---|
| Attend a studio 2 days in a row (no pause) | Trigger **2x XP Multiplier** |
| Each consecutive day thereafter | 2x remains active (does **not** stack beyond 2x) |
| Miss a day | Streak resets; multiplier drops to 1x |

**Timezone robustness:** The 24-hour streak window is anchored to **UTC midnight**, not local time. If a user travels from Mason, OH (UTC-5) to Tokyo (UTC+9), the window remains consistent: a check-in must occur within 24 hours of the *previous* check-in's UTC timestamp.

Streak tracking is stored in **Redis** with a TTL of 25 hours on the key `streak:{user_id}` — if the key expires before the next check-in, the streak is broken.

### 8.4 Leveling Tiers

XP requirements scale **logarithmically**: `xp_required(level) = floor(100 · level^1.6)`.

| Level | Title | XP Required |
|---|---|---|
| 1 | Recruit | 0 |
| 5 | Grinder | 720 |
| 10 | Gladiator | 3,100 |
| 15 | Apex | 7,650 |
| 20 | Grandmaster | 16,000 |
| 30 | Immortal | 38,000 |
| 40 | Sovereign | 78,000 |
| 50 | Legend | 150,000 |

---

## 9 · Studio Owner Dashboard

> API specification → **[references/studio_api.md](references/studio_api.md)**

### 9.1 Overview

Studio owners get a dedicated dashboard with:

- **Real-time stats:** active members, average RES, city rank, active missions
- **Mission Creator:** define custom "Studio Missions" scoped to their member list
- **Analytics:** compare their studio against other studios in the same city
- **System Controls:** toggle which metrics drive the studio leaderboard

### 9.2 Studio Missions

Owners create time-bound challenges like *"Burn 5,000 calories this month"*. Each mission has:

```json
{
  "mission_id":  "uuid",
  "studio_id":   "uuid",
  "name":        "February Burn Challenge",
  "metric":      "calories",
  "target":      5000,
  "start_date":  "2026-02-01",
  "end_date":    "2026-02-28"
}
```

Progress is tracked per-member; completing 25/50/75/100% milestones awards XP.

### 9.3 System Controls — Metric Focus

Studio owners can toggle leaderboard weights for their studio:

- Individual metrics (Strain, HR, Steps, Recovery) can be enabled/disabled.
- Active weights are re-normalized to sum to 100%.
- Changes take effect on the next leaderboard refresh cycle.
- Example: *"This week we focus on Recovery"* → disable Strain/Steps/HR → Recovery = 100%.

---

## 10 · Biometric Translation Layer (BTL)

> Full field mapping & scoring reference → **[references/biometrics_mapping.md](references/biometrics_mapping.md)**

### 10.1 Overview

The BTL converts raw wearable data (Whoop API + Apple HealthKit) into four Pilates-specific stat categories, then normalizes them into a composite **Vibe Score** (0–100) so users on different devices compete on a level playing field.

### 10.2 Stat Categories

| Category | Icon | Source | Scoring Logic |
|---|---|---|---|
| **Power** | ⚡ | Muscular Strain (70%) + Active Calories (30%) | "Precision Power" +8 bonus for high strain with low HR |
| **Flow** | 🌊 | HR Zone 1+2 time + Respiratory Rate | Penalized if >10% of class in Zone 4 |
| **Grit** | 🔥 | Workout Duration + Total Strain | Linear scaling; studio sessions only |
| **Zen** | 🧘 | HRV (percentile-based) + Recovery % | Daily "Best Recovered Athlete" leaderboard |

### 10.3 Vibe Score

```
Vibe Score = 0.30 × Power + 0.25 × Flow + 0.25 × Grit + 0.20 × Zen
```

Missing categories (device doesn't provide the data) have their weight redistributed to the remaining categories.

### 10.4 Activity Type Detection

- **Recognized Pilates labels:** pilates, solidcore, [solidcore], reformer, megaformer, lagree, barre
- **Generic labels** (functional training, strength training, other): receive a **0.8× multiplier** on Power to encourage using specific Pilates tracking modes
