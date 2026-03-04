# Geo Logic — Spatial Ranking & Boundary Handling

> **Purpose:** Define how CompeteHealth resolves a user's location into City → State → Country tiers and manages geographic leaderboard assignment.

---

## 1 · Boundary Data Sources

### 1.1 Datasets

| Tier | Source | Format | Update Cadence |
|---|---|---|---|
| **City** | US Census TIGER/Line (US), GeoNames + OSM (international) | GeoJSON / Shapefile | Annually |
| **State / Province** | Natural Earth Admin-1 boundaries | GeoJSON | Annually |
| **Country** | Natural Earth Admin-0 boundaries | GeoJSON | Annually |

### 1.2 Storage

All boundary polygons are loaded into PostgreSQL with **PostGIS**:

```sql
CREATE TABLE boundaries (
    id          SERIAL PRIMARY KEY,
    tier        TEXT NOT NULL CHECK (tier IN ('city', 'state', 'country')),
    name        TEXT NOT NULL,
    iso_code    TEXT,          -- e.g., 'US-OH' for Ohio, 'US' for country
    geom        GEOGRAPHY(MULTIPOLYGON, 4326) NOT NULL
);

CREATE INDEX idx_boundaries_geom ON boundaries USING GIST (geom);
CREATE INDEX idx_boundaries_tier ON boundaries (tier);
```

- **SRID 4326** (WGS 84) — standard for GPS coordinates.
- `GEOGRAPHY` type (not `GEOMETRY`) for correct distance/area calculations on a spheroid.

---

## 2 · Point-in-Polygon Resolution

### 2.1 Core Query

When a user's location is captured, resolve all three tiers in a single query:

```sql
SELECT
    b.tier,
    b.name,
    b.id AS boundary_id
FROM boundaries b
WHERE ST_Contains(b.geom::geometry, ST_SetSRID(ST_Point(:lng, :lat), 4326)::geometry)
ORDER BY b.tier;
```

**Returns** up to 3 rows: one `city`, one `state`, one `country`.

### 2.2 Fallback Logic

| Scenario | Resolution |
|---|---|
| Point matches city + state + country | Assign all three ✅ |
| Point matches state + country only (rural area) | `city_id = NULL`, user appears on state & country boards only |
| Point matches country only (open water, remote) | `city_id = NULL`, `state_id = NULL`, country & global boards only |
| Point matches nothing (ocean, Antarctica) | Assign to **Global** leaderboard only |

### 2.3 Ambiguity Resolution

Some boundary datasets contain overlapping city polygons (e.g., city vs. CDP vs. metro area). When multiple `city`-tier matches exist:

1. Prefer the polygon with the smallest area: `ORDER BY ST_Area(geom) ASC LIMIT 1`.
2. This selects the most specific municipality over a larger metro region.

---

## 3 · User Location Lifecycle

### 3.1 Capture Cadence

| Trigger | Precision | Action |
|---|---|---|
| **App foreground open** | City-level (±5 km) | Full tier resolution |
| **Background refresh** | Every 6 hours | Re-resolve only if device moved >10 km from last known point |
| **Manual override** | User sets "Home City" | Pin city; disable auto-detection |

### 3.2 Location Pinning & Caching

Users don't relocate often. To avoid unnecessary PostGIS queries:

1. After resolution, store `(city_id, state_id, country_code)` on the user record.
2. Cache the result with a **24-hour TTL**.
3. On the next location event, compute `ST_Distance` between the new point and the cached point:
   - If < 10 km → skip re-resolution, keep cached assignment.
   - If ≥ 10 km → re-resolve all tiers.

```sql
-- Distance check (meters)
SELECT ST_Distance(
    ST_SetSRID(ST_Point(:new_lng, :new_lat), 4326)::geography,
    ST_SetSRID(ST_Point(:cached_lng, :cached_lat), 4326)::geography
) AS distance_m;
```

### 3.3 Location Update Flow

```
Location Event
      │
      ▼
  Distance from cache < 10 km?
      │                │
     YES              NO
      │                │
   Keep cache     Run ST_Contains
      │                │
      │           ┌────▼─────┐
      │           │ Upsert   │
      │           │ user     │
      │           │ geo_data │
      │           └────┬─────┘
      │                │
      └───────┬────────┘
              ▼
    Return (city, state, country)
```

---

## 4 · Studio & Class Scoping

Studio and class leaderboards are not geo-spatial — they are **event-driven** via check-ins.

### 4.1 Check-In Event

```json
{
  "user_id":    "uuid",
  "studio_id":  "uuid",
  "class_id":   "uuid | null",
  "timestamp":  "ISO-8601"
}
```

### 4.2 Studio Registration

Studios register with a fixed location:

```sql
CREATE TABLE studios (
    id          UUID PRIMARY KEY,
    name        TEXT NOT NULL,
    location    GEOGRAPHY(POINT, 4326),
    city_id     INT REFERENCES boundaries(id),
    state_id    INT REFERENCES boundaries(id),
    country_code CHAR(2)
);
```

- Studio geo-assignment is resolved **once** at registration via the same `ST_Contains` query.
- Users checked into a studio inherit its `city_id` for the duration of their session.

### 4.3 Class Sessions

```sql
CREATE TABLE class_sessions (
    id          UUID PRIMARY KEY,
    studio_id   UUID REFERENCES studios(id),
    name        TEXT NOT NULL,        -- e.g., '6:00 PM HIIT'
    start_time  TIMESTAMPTZ NOT NULL,
    end_time    TIMESTAMPTZ NOT NULL,
    is_active   BOOLEAN DEFAULT false
);
```

- `is_active` flips to `true` at `start_time`, `false` at `end_time + 5 min` (cool-down).
- While active, all checked-in users feed the Redis class leaderboard.

---

## 5 · City Boss — Daily Aggregation

The "City Boss" feature requires computing the average RES for each city daily.

### 5.1 Aggregation Query

```sql
-- Run at 00:05 UTC daily
INSERT INTO city_daily_stats (city_id, date, avg_res, boss_user_id, participant_count)
SELECT
    gs.city_id,
    CURRENT_DATE - 1 AS date,
    AVG(gs.res) AS avg_res,
    (
        SELECT user_id
        FROM geo_scores sub
        WHERE sub.city_id = gs.city_id
          AND sub.updated_at >= CURRENT_DATE - 1
          AND sub.updated_at < CURRENT_DATE
        ORDER BY sub.res DESC
        LIMIT 1
    ) AS boss_user_id,
    COUNT(*) AS participant_count
FROM geo_scores gs
WHERE gs.updated_at >= CURRENT_DATE - 1
  AND gs.updated_at < CURRENT_DATE
  AND gs.city_id IS NOT NULL
GROUP BY gs.city_id;
```

### 5.2 "Beat the City" Check

After a user's daily RES is finalized:

```sql
SELECT
    CASE WHEN :user_res > cds.avg_res THEN true ELSE false END AS beat_city
FROM city_daily_stats cds
WHERE cds.city_id = :user_city_id
  AND cds.date = CURRENT_DATE - 1;
```

If `beat_city = true`, the +5 bonus is applied (see [scoring_math.md](scoring_math.md) §6).

---

## 6 · Privacy Constraints

### 6.1 What Is Stored

| Data Point | Stored? | Visible to Others? |
|---|---|---|
| Coarse city name | ✅ | ✅ (e.g., "Cincinnati") |
| `city_id`, `state_id` | ✅ | ❌ (internal IDs only) |
| Exact lat/lng | ❌ Discarded after resolution | ❌ |
| Street address | ❌ Never captured | ❌ |
| Home location | Only if user opts into manual override | ❌ |

### 6.2 Rules

1. **No precise coordinates are persisted.** After `ST_Contains` resolves the tiers, the raw `(lat, lng)` pair is discarded from all stores.
2. **City-level only.** Leaderboards display city names, never neighborhoods or zip codes.
3. **Opt-out available.** Users can disable geo-leaderboards entirely; they'll appear only on Class/Studio/Global boards.

---

## 7 · Performance Considerations

### 7.1 Index Strategy

- The GIST index on `boundaries.geom` enables sub-millisecond `ST_Contains` queries for a dataset of ~50,000 polygons.
- For hot-path leaderboard reads, composite indexes on `(city_id, res DESC)` ensure top-N queries avoid sequential scans.

### 7.2 Materialized Views

For City/State/Country leaderboard pages, use materialized views refreshed on a schedule:

```sql
CREATE MATERIALIZED VIEW city_rankings AS
SELECT
    user_id,
    display_name,
    res,
    city_id,
    RANK() OVER (PARTITION BY city_id ORDER BY res DESC) AS rank
FROM geo_scores
WHERE city_id IS NOT NULL;

-- Refresh every 60 seconds
REFRESH MATERIALIZED VIEW CONCURRENTLY city_rankings;
```

`CONCURRENTLY` ensures reads are never blocked during refresh.

### 7.3 Scaling Notes

| Concern | Mitigation |
|---|---|
| Boundary dataset size | ~50k polygons fits in PostGIS RAM cache; no sharding needed |
| User location updates at scale | 24-hour cache + 10 km threshold eliminates >95% of redundant queries |
| Leaderboard reads (hot path) | Materialized views + Redis sorted sets; Postgres handles overflow |
| Cross-country rankings | Partition `geo_scores` by `country_code` for query isolation |
