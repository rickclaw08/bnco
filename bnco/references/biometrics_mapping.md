# Biometric Translation Layer (BTL) — Field Mapping & Scoring Reference

> **Purpose:** Define exactly how raw Apple HealthKit and Whoop API payloads are translated into the four Pilates stat categories that power the CompeteHealth leaderboard.

---

## 1 · Raw Field Mapping

### 1.1 Whoop → BTL

| Whoop API Field | BTL Canonical Field | Used In |
|---|---|---|
| `muscular_strain` / `strain.muscular` | `muscularStrain` | Power |
| `total_strain` / `strain.total` | `totalStrain` | Grit |
| `respiratory_rate` / `sleep.respiratory_rate` | `respiratoryRate` | Flow |
| `hrv` / `recovery.hrv` | `hrv` | Zen |
| `recovery_pct` / `recovery.score` | `recoveryPct` | Zen |
| `avg_hr` / `hr.average` | `avgHR` | Power (bonus check) |
| `hr_zones` (object) | `hrZones` | Flow |
| `active_calories` / `calories.active` | `activeCal` | Power |
| `duration_min` / `duration_ms ÷ 60000` | `durationMin` | Grit, Flow |
| `workout_type` / `sport` | `workoutType` | Activity detection |

### 1.2 Apple HealthKit → BTL

| Apple HealthKit Field | BTL Canonical Field | Used In |
|---|---|---|
| `active_calories` / `activeEnergyBurned` | `activeCal` | Power |
| `hr_avg` / `average_heart_rate` | `avgHR` | Power (bonus check) |
| `hr_max` / `max_heart_rate` | `maxHR` | — |
| `hr_zones` (array `[z0, z1, z2, z3, z4]`) | `hrZones` | Flow |
| `hrv` | `hrv` | Zen |
| `workout_duration` / `duration` | `durationMin` | Grit, Flow |
| `workout_type` / `activityType` | `workoutType` | Activity detection |

**Fields not available from Apple:** `muscularStrain`, `totalStrain`, `respiratoryRate`, `recoveryPct`. These are set to `null` and their weights are redistributed (see §4).

---

## 2 · Stat Categories

### 2.1 Power (Intensity)

```
IF muscularStrain AND activeCal available:
    strainNorm = clamp(muscularStrain / 21 × 100)
    calNorm    = clamp(min(activeCal / 600, 1) × 100)
    score      = strainNorm × 0.70 + calNorm × 0.30

ELIF only muscularStrain:
    score = clamp(muscularStrain / 21 × 100)

ELIF only activeCal:
    score = clamp(min(activeCal / 600, 1) × 100)
```

**Precision Power Bonus (+8):**

```
IF muscularStrain > 12 AND avgHR < (maxHR_estimate × 0.70):
    score += 8
```

This rewards controlled, high-intensity Pilates work (heavy springs, slow tempo) where muscular load is high but cardiovascular elevation stays in Zone 2 or below.

**Activity Type Multiplier:**

```
IF workoutType ∈ GENERIC_LABELS:
    score *= 0.80
```

### 2.2 Flow (Control)

```
controlPct = (zone1Min + zone2Min) / classDuration
score      = clamp(controlPct × 100)
```

**Respiratory Rate Bonus (0–10):**

```
IF 12 ≤ respiratoryRate ≤ 18:
    score += 10
ELSE:
    deviation = distance from [12, 18] range
    score += clamp(10 - deviation × 2)
```

**Zone 4 Penalty:**

```
zone4Pct = zone4Min / classDuration
IF zone4Pct > 0.10:
    penaltyMult = clamp(1 - (zone4Pct - 0.10), 0.50, 1.00)
    score *= penaltyMult
```

> Spending >10% of class in Zone 4 indicates loss of breath control — the penalty scales linearly, bottoming at a 0.5× floor.

### 2.3 Grit (Duration / Volume)

```
durationScore = clamp(durationMin / 60 × 50, 0, 50)
strainScore   = clamp(totalStrain / 21 × 50, 0, 50)
score         = durationScore + strainScore
```

**Constraint:** Only verified **Studio Sessions** earn Grit. Non-studio workouts return `0`.

**Apple-only fallback:** When `totalStrain` is null, duration scales to the full 0–100 range: `score = clamp(durationMin / 60 × 100)`.

### 2.4 Zen (Recovery)

```
hrvNorm = percentileScore(hrv, ageBandPercentiles)
recNorm = clamp(recoveryPct)

IF hrv AND recoveryPct available:
    score = hrvNorm × 0.60 + recNorm × 0.40

ELIF only hrv:
    score = hrvNorm

ELIF only recoveryPct:
    score = recNorm
```

**HRV Percentile Anchors (ms RMSSD):**

| Age Band | p25 | p50 | p75 | p95 |
|---|---|---|---|---|
| 18–29 | 30 | 55 | 80 | 120 |
| 30–39 | 25 | 45 | 70 | 105 |
| 40–49 | 20 | 38 | 60 | 90 |
| 50–59 | 15 | 30 | 50 | 75 |
| 60+ | 12 | 25 | 42 | 65 |

The percentile function maps HRV to 0–100 linearly between anchors.

---

## 3 · Activity Type Detection

### 3.1 Recognised Pilates Labels

| Label (case-insensitive) | Type |
|---|---|
| `pilates`, `solidcore`, `[solidcore]`, `reformer`, `megaformer` | Pilates |
| `club pilates`, `lagree`, `core reform`, `barre` | Pilates |

### 3.2 Generic Labels (0.8× Power Multiplier)

| Label | Reason |
|---|---|
| `functional training`, `strength training` | Encourages users to enable specific Pilates tracking mode |
| `traditional strength training`, `other`, `mixed cardio` | Same |

> Any unrecognised label also receives the 0.8× multiplier.

---

## 4 · Cross-Device Normalization

### 4.1 Missing-Field Weight Redistribution

When a stat category returns `null` (device doesn't provide the required data), its weight is dropped and the remaining weights are re-normalized to sum to 1.0:

```
activeCategories = [(w, s) for each category if score ≠ null]
totalWeight      = sum(w for w in activeCategories)
vibeScore        = sum((w / totalWeight) × s for w, s in activeCategories)
```

### 4.2 Default Vibe Score Weights

| Category | Weight | Rationale |
|---|---|---|
| Power | 0.30 | Primary effort indicator for Pilates |
| Flow | 0.25 | Breath control is core to the practice |
| Grit | 0.25 | Duration rewards commitment |
| Zen | 0.20 | Recovery differentiates consistent athletes |

### 4.3 Typical Data Availability

| Provider | Power | Flow | Grit | Zen |
|---|---|---|---|---|
| **Whoop** | Full (strain + cal) | Full (HR zones + resp rate) | Full (duration + strain) | Full (HRV + recovery) |
| **Apple Watch** | Partial (cal only) | Partial (HR zones only) | Partial (duration only) | Partial (HRV only) |

Both devices produce a valid Vibe Score, but Whoop users get richer sub-category data. The weight redistribution ensures the composite scores remain comparable.

---

## 5 · Worked Examples

### 5.1 Whoop User — 32 y/o, [solidcore] Class

**Input:**
```json
{
  "muscular_strain": 14.8,
  "total_strain": 16.2,
  "respiratory_rate": 15.4,
  "hrv": 62,
  "recovery_pct": 81,
  "avg_hr": 128,
  "hr_zones": { "zone0Min": 3, "zone1Min": 12, "zone2Min": 18, "zone3Min": 8, "zone4Min": 4 },
  "active_calories": 420,
  "duration_min": 45,
  "workout_type": "[solidcore]"
}
```

**Calculations:**

```
Power:
  strainNorm = (14.8 / 21) × 100 = 70.48
  calNorm    = min(420/600, 1) × 100 = 70.00
  base       = 70.48 × 0.70 + 70.00 × 0.30 = 49.34 + 21.00 = 70.34
  maxHR_est  = 207 - 0.7 × 32 = 184.6
  zone2Ceil  = 184.6 × 0.70 = 129.22
  avgHR=128 < 129.22 AND strain=14.8 > 12 → Precision Power +8
  Power = 78.34 ✅

Flow:
  controlPct = (12 + 18) / 45 = 0.667
  base       = 66.67
  respRate=15.4 ∈ [12,18] → +10 = 76.67
  zone4Pct   = 4/45 = 0.089 < 0.10 → no penalty
  Flow = 76.67 ✅

Grit:
  durationScore = (45/60) × 50 = 37.50
  strainScore   = (16.2/21) × 50 = 38.57
  Grit = 76.07 ✅

Zen:
  ageBand=30-39, p50=45, p75=70
  hrv=62 → between p50 and p75 → 50 + (62-45)/(70-45) × 25 = 50 + 17 = 67.00
  recNorm = 81
  Zen = 67.00 × 0.60 + 81 × 0.40 = 40.20 + 32.40 = 72.60 ✅

Vibe Score:
  0.30 × 78.34 + 0.25 × 76.67 + 0.25 × 76.07 + 0.20 × 72.60
  = 23.50 + 19.17 + 19.02 + 14.52
  = 76.21 ✅
```

### 5.2 Apple Watch User — 32 y/o, Pilates Class

**Input:**
```json
{
  "active_calories": 385,
  "hr_avg": 134,
  "hr_zones": [2, 10, 20, 10, 3],
  "hrv": 48,
  "workout_duration": 50,
  "workout_type": "Pilates"
}
```

**Calculations:**

```
Power:
  activeCal only → score = min(385/600, 1) × 100 = 64.17
  No muscular strain → no Precision Power check
  Power = 64.17 ✅

Flow:
  controlPct = (10 + 20) / 50 = 0.60
  base = 60.00
  No respiratory rate → +0
  zone4Pct = 3/50 = 0.06 < 0.10 → no penalty
  Flow = 60.00 ✅

Grit:
  No totalStrain → duration-only mode
  score = (50/60) × 100 = 83.33 ✅

Zen:
  hrv=48, p50=45 → 50 + (48-45)/(70-45) × 25 = 53.00
  No recoveryPct → HRV-only mode
  Zen = 53.00 ✅

Vibe Score:
  0.30 × 64.17 + 0.25 × 60.00 + 0.25 × 83.33 + 0.20 × 53.00
  = 19.25 + 15.00 + 20.83 + 10.60
  = 65.68 ✅
```

### 5.3 Fairness Check

| Metric | Whoop User | Apple User |
|---|---|---|
| Vibe Score | **76.21** | **65.68** |
| Power | 78.34 | 64.17 |
| Flow | 76.67 | 60.00 |
| Grit | 76.07 | 83.33 |
| Zen | 72.60 | 53.00 |

The Whoop user scored higher overall because they worked harder across more dimensions. The Apple user's higher Grit (longer session) is correctly reflected. Scores are comparable despite different data availability.

---

## 6 · Edge Cases

| Scenario | Handling |
|---|---|
| All 4 categories null | `vibeScore = null` — user is not ranked |
| Studio session not verified | Grit = 0, other categories computed normally |
| Zone data missing entirely | Flow = null, weight redistributed |
| HRV = 0 | Mapped to percentile 0 → Zen = 0 (or blended with recoveryPct) |
| Duration > 90 min | Grit duration component caps at 50 pts (no bonus for marathon sessions) |
| Generic activity + low calories | Power is double-penalized (low base + 0.8×) — working as intended |
