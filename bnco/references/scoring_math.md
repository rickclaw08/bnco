# Scoring Math — The Equalizer Algorithm

> **Purpose:** Ensure fair competition across ages, fitness levels, and device types by ranking users on *relative effort*, not raw output.

---

## 1 · Relative Effort Score (RES) — Overview

The Relative Effort Score is a composite metric that answers: **"How hard did this user work compared to their own personal baseline?"**

```
RES = w₁·S_strain + w₂·S_hr + w₃·S_steps + w₄·S_recovery
```

| Symbol | Meaning | Range |
|---|---|---|
| `S_strain` | Normalized strain sub-score | 0 – 100 |
| `S_hr` | Normalized heart-rate sub-score | 0 – 100 |
| `S_steps` | Normalized step sub-score | 0 – 100 |
| `S_recovery` | Normalized recovery sub-score | 0 – 100 |
| `w₁…w₄` | Tunable weights (must sum to 1.0) | — |

**Default weights:**

| Weight | Value | Rationale |
|---|---|---|
| `w₁` (Strain) | 0.35 | Primary effort indicator |
| `w₂` (HR) | 0.25 | Physiological intensity signal |
| `w₃` (Steps) | 0.20 | Activity volume proxy |
| `w₄` (Recovery) | 0.20 | Readiness context — rewards training when recovered |

> Weights can be overridden per leaderboard type. For example, a **running-studio** board might increase `w₃` to 0.35 and reduce `w₁` to 0.20.

---

## 2 · Sub-Score Functions

### 2.1 Strain Sub-Score — `S_strain`

```
improvement_ratio = (strain_today - baseline_strain) / baseline_strain

S_strain = clamp(50 + 50 · improvement_ratio, 0, 100)
```

- `baseline_strain` = 7-day exponentially weighted moving average (α = 0.3).
- A score of **50** means the user matched their baseline.
- Each 1% improvement above baseline adds ≈ 0.5 points; each 1% below subtracts ≈ 0.5 points.
- Clamped to `[0, 100]` to prevent outlier distortion.

### 2.2 Heart Rate Sub-Score — `S_hr`

```
max_hr_estimate = 207 - 0.7 · age          // Gellish formula
pct_max_hr      = hr_avg / max_hr_estimate
zone_effort     = pct_max_hr / threshold

S_hr = clamp(zone_effort · 100, 0, 100)
```

| Variable | Description |
|---|---|
| `hr_avg` | Average HR during the activity window |
| `age` | User-provided age (fallback: 30 if unknown) |
| `threshold` | 0.90 — i.e., 90% of max HR = score of 100 |

**Why this works:** A 55-year-old with a max HR of 168 bpm hitting 151 bpm (90%) scores the same as a 22-year-old with max HR 192 bpm hitting 173 bpm (90%). Effort is equalized.

### 2.3 Steps Sub-Score — `S_steps`

```
improvement_ratio = (steps_today - baseline_steps) / baseline_steps

S_steps = clamp(50 + 50 · improvement_ratio, 0, 100)
```

- `baseline_steps` = 7-day simple moving average.
- Identical curve shape to `S_strain` for consistency.

### 2.4 Recovery Sub-Score — `S_recovery`

Recovery is an *inverted* signal: high recovery rewards readiness, but the *interaction* with effort matters.

```
recovery_norm  = recovery / recovery_ceiling(age)
effort_context = (S_strain + S_hr) / 2

S_recovery = clamp(recovery_norm · 50 + effort_context · 0.5, 0, 100)
```

| Age Band | `recovery_ceiling` |
|---|---|
| 18–29 | 100 |
| 30–39 | 98 |
| 40–49 | 95 |
| 50–59 | 90 |
| 60+ | 85 |

**Interpretation:** A user with 95% recovery who then trains hard (high `effort_context`) earns a top score. A user with 95% recovery who doesn't train gets ~47 — good readiness alone isn't enough.

---

## 3 · Composite Score Assembly

```python
def compute_res(metrics: dict, baselines: dict, age: int, weights: list[float]) -> float:
    s_strain   = strain_sub(metrics["strain"], baselines["strain"])
    s_hr       = hr_sub(metrics["hr_avg"], age)
    s_steps    = steps_sub(metrics["steps"], baselines["steps"])
    s_recovery = recovery_sub(metrics["recovery"], age, s_strain, s_hr)

    res = (
        weights[0] * s_strain
      + weights[1] * s_hr
      + weights[2] * s_steps
      + weights[3] * s_recovery
    )
    return round(res, 2)  # 0.00 – 100.00
```

---

## 4 · Worked Examples

### 4.1 Beginner — Sarah, 42 y/o, casual gym-goer

| Metric | Today | 7-Day Baseline |
|---|---|---|
| Strain | 9.5 | 7.0 |
| Avg HR | 142 bpm | — |
| Steps | 8,200 | 6,500 |
| Recovery | 78% | — |

**Calculations:**

```
S_strain   = clamp(50 + 50 · (9.5 - 7.0) / 7.0, 0, 100)
           = clamp(50 + 17.86, 0, 100) = 67.86

max_hr     = 207 - 0.7 · 42 = 177.6
pct_max    = 142 / 177.6 = 0.7996
S_hr       = clamp(0.7996 / 0.90 · 100, 0, 100) = 88.84

S_steps    = clamp(50 + 50 · (8200 - 6500) / 6500, 0, 100)
           = clamp(50 + 13.08, 0, 100) = 63.08

recovery_ceiling(42) = 95
recovery_norm = 78 / 95 = 0.8211
effort_ctx    = (67.86 + 88.84) / 2 = 78.35
S_recovery    = clamp(0.8211 · 50 + 78.35 · 0.5, 0, 100)
              = clamp(41.05 + 39.18, 0, 100) = 80.23

RES = 0.35·67.86 + 0.25·88.84 + 0.20·63.08 + 0.20·80.23
    = 23.75 + 22.21 + 12.62 + 16.05
    = 74.63
```

### 4.2 Advanced Athlete — Marcus, 26 y/o, competitive CrossFitter

| Metric | Today | 7-Day Baseline |
|---|---|---|
| Strain | 18.2 | 17.5 |
| Avg HR | 165 bpm | — |
| Steps | 12,400 | 13,000 |
| Recovery | 62% | — |

**Calculations:**

```
S_strain   = clamp(50 + 50 · (18.2 - 17.5) / 17.5, 0, 100)
           = clamp(50 + 2.0, 0, 100) = 52.0

max_hr     = 207 - 0.7 · 26 = 188.8
pct_max    = 165 / 188.8 = 0.8740
S_hr       = clamp(0.8740 / 0.90 · 100, 0, 100) = 97.11

S_steps    = clamp(50 + 50 · (12400 - 13000) / 13000, 0, 100)
           = clamp(50 - 2.31, 0, 100) = 47.69

recovery_ceiling(26) = 100
recovery_norm = 62 / 100 = 0.62
effort_ctx    = (52.0 + 97.11) / 2 = 74.56
S_recovery    = clamp(0.62 · 50 + 74.56 · 0.5, 0, 100)
              = clamp(31.0 + 37.28, 0, 100) = 68.28

RES = 0.35·52.0 + 0.25·97.11 + 0.20·47.69 + 0.20·68.28
    = 18.20 + 24.28 + 9.54 + 13.66
    = 65.68
```

### 4.3 Fairness Outcome

| User | Raw Strain | RES |
|---|---|---|
| Sarah (beginner) | 9.5 | **74.63** |
| Marcus (advanced) | 18.2 | **65.68** |

Sarah pushed significantly harder *relative to her own capacity* — the Equalizer correctly rewards her more, despite Marcus having nearly double the raw strain. Marcus had a routine day against his baseline; Sarah had a breakout day against hers.

---

## 5 · Edge Cases & Missing Data

### 5.1 Missing Metrics

If a metric is `null` (device doesn't provide it):

1. Drop the sub-score from the composite.
2. Re-normalize the remaining weights to sum to 1.0.

```python
active = [(w, s) for w, s in zip(weights, scores) if s is not None]
w_sum  = sum(w for w, _ in active)
res    = sum((w / w_sum) * s for w, s in active)
```

### 5.2 Cold Start (< 7 Days of Data)

- Days 1–2: Use population median baselines for the user's age band.
- Days 3–6: Use available-day average.
- Day 7+: Normal 7-day rolling baseline.

### 5.3 Device Switching

When a user connects a new device:

- Retain existing baselines for overlapping metrics.
- For new-only metrics (e.g., Garmin's Body Battery), apply cold-start logic.
- Never mix raw values across devices for the same metric; re-baseline after switching.

### 5.4 Zero-Activity Days

- All improvement ratios compute to `(0 - baseline) / baseline = -1.0`.
- Sub-scores floor at **0**. RES = **0.00**.
- Zero-activity days break Vibe Streaks (see SKILL.md §6.3).

---

## 6 · Bonus Modifiers

Bonuses are applied **after** the base RES calculation, capped at a total of +15:

| Source | Bonus | Condition |
|---|---|---|
| Beat the City | +5 | RES > city average (daily) |
| Vibe Streak (Bronze) | +2/day | Top 50% × 3 days |
| Vibe Streak (Silver) | +5/day | Top 25% × 7 days |
| Vibe Streak (Gold) | +10/day | Top 10% × 14 days |
| Ghost Slayer fragment | +1 | Beat ghost at any minute offset |

```
final_res = min(base_res + sum(bonuses), 115.00)
```

The hard cap of **115** prevents runaway score inflation while still rewarding loyalty and consistency.

---

## 7 · XP Scaling & Leveling

### 7.1 XP Earning Formula

```
daily_base_xp = workout_xp + class_xp + beat_baseline_xp + beat_city_xp + mission_xp
daily_xp      = daily_base_xp × streak_multiplier
```

| Source | XP | Trigger |
|---|---|---|
| Workout sync | 10 | Each workout synced |
| Class completion | 25 | Studio check-in + class attendance |
| Beat RES baseline | 15 | Daily RES > 7-day rolling average |
| Beat the City | 10 | Daily RES > city average |
| Mission milestone | 20 | Each 25% completion threshold |
| Perfect Week | 20 (bonus) | 7 consecutive sync days |

### 7.2 Logarithmic Level Curve

```
xp_required(level) = floor(100 × level^1.6)
```

| Level | XP Required | Incremental XP |
|---|---|---|
| 1 → 2 | 100 | 100 |
| 5 → 6 | 330 | — |
| 10 → 11 | 700 | — |
| 20 → 21 | 2,100 | — |
| 30 → 31 | 3,800 | — |
| 40 → 41 | 5,900 | — |
| 49 → 50 | 8,600 | — |

**Design rationale:** Early levels are fast (new-user hook), mid-levels feel progressive, endgame levels require sustained effort. A casual user earning ~50 XP/day reaches Level 10 in ~2 months; a power user earning ~150 XP/day reaches Level 50 in ~3 years.

---

## 8 · 2x Vibe Streak Multiplier

### 8.1 Logic

```
IF last_checkin_utc + 24h >= current_checkin_utc
  THEN streak_days += 1
  IF streak_days >= 2
    THEN multiplier = 2.0
ELSE
  streak_days = 1
  multiplier  = 1.0
```

- The multiplier activates on **Day 2** of a consecutive streak and stays at **2x** — it does not stack to 3x, 4x, etc.
- All XP earned on multiplier days is doubled *before* being added to the user's total.

### 8.2 Timezone Robustness

The streak window is anchored to **UTC**, not local time:

```
streak_key     = "streak:{user_id}"
streak_ttl     = 25 hours    // 24h + 1h grace period
last_checkin   = GET streak_key → timestamp (UTC)
current_time   = NOW() in UTC

IF current_time - last_checkin <= 24h:
    INCR streak_count
ELSE:
    SET streak_count = 1

SET streak_key = current_time
EXPIRE streak_key streak_ttl
```

**Travel scenario:** User checks in at 6 PM EST (23:00 UTC) in Mason, OH, then flies to Tokyo and checks in at 7 PM JST (10:00 UTC next day). Elapsed = 11h — streak preserved. ✅

### 8.3 Worked Example

```
Day 1: Check-in 08:00 UTC.  Base XP = 50.  Multiplier = 1x.  Total = 50.
Day 2: Check-in 19:00 UTC.  Elapsed = 35h > 24h. Streak broken.
       Base XP = 50.  Multiplier = 1x.  Total = 50.

Day 3: Check-in 07:00 UTC.  Base XP = 45.  Multiplier = 1x.  Total = 45.
Day 4: Check-in 09:00 UTC.  Elapsed = 26h > 24h. Streak broken. 
       Base XP = 60.  Multiplier = 1x.  Total = 60.

Day 5: Check-in 10:00 UTC.  Base XP = 55.  Multiplier = 1x.  Total = 55.
Day 6: Check-in 08:00 UTC.  Elapsed = 22h ≤ 24h. Streak = 2. ✅
       Base XP = 40.  Multiplier = 2x.  Total = 80.
Day 7: Check-in 12:00 UTC.  Elapsed = 28h > 24h. Streak broken.
       Base XP = 50.  Multiplier = 1x.  Total = 50.
```
