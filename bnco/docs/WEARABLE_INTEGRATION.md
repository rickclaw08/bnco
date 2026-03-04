# bnco Wearable Integration Guide

This document covers how bnco ingests biometric data from wearable devices, processes it into scores, and handles cross-device normalization.

---

## Overview

bnco supports three data sources:

| Source | Method | Status | Data Richness |
|--------|--------|--------|---------------|
| WHOOP | Cloud-to-cloud (OAuth + Webhooks) | Coded, untested | Full (strain, HRV, recovery, respiratory) |
| Apple Watch | On-device (HealthKit + CoreMotion) | Needs iOS app | Partial (calories, HR zones, HRV, stability) |
| Terra API | Unified proxy (REST + Webhooks) | Not started | Full (aggregates all providers) |

Users can connect one or both primary devices (WHOOP + Apple Watch). Scores are computed with whatever data is available, using weight redistribution for missing fields.

---

## 1. WHOOP Developer API

### 1.1 OAuth 2.0 Flow

WHOOP uses standard OAuth 2.0 Authorization Code flow.

**Step 1: Redirect user to WHOOP authorization**

```
https://api.prod.whoop.com/oauth/oauth2/auth
  ?client_id={WHOOP_CLIENT_ID}
  &redirect_uri={WHOOP_REDIRECT_URI}
  &response_type=code
  &scope=read:profile read:workout
  &state={user_id}
```

**Required scopes:**
- `read:profile` - User profile and basic info
- `read:workout` - Workout data, strain, recovery

**Step 2: User authorizes on WHOOP**

WHOOP redirects back to our callback URL with an authorization `code`.

**Step 3: Exchange code for tokens**

```
POST https://api.prod.whoop.com/oauth/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code={authorization_code}
&client_id={WHOOP_CLIENT_ID}
&client_secret={WHOOP_CLIENT_SECRET}
&redirect_uri={WHOOP_REDIRECT_URI}
```

**Response:**

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**Step 4: Fetch user profile**

```
GET https://api.prod.whoop.com/developer/v1/user/profile/basic
Authorization: Bearer {access_token}
```

**Step 5: Store tokens**

We store `access_token`, `refresh_token`, and `whoop_user_id` in the `users` table. Tokens are used for polling fallback and profile fetches.

### 1.2 Webhook Setup

WHOOP sends workout data to our server automatically via webhooks.

**Webhook URL:** `https://api.bnco.app/api/webhooks/whoop`

**Verification:** WHOOP signs payloads with HMAC-SHA256. We verify using `WHOOP_WEBHOOK_SECRET`:

```javascript
const expected = crypto
  .createHmac('sha256', process.env.WHOOP_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== expected) {
  // Reject
}
```

**Webhook payload (workout.completed):**

```json
{
  "user_id": "whoop-user-id-123",
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

### 1.3 WHOOP Data Fields

| WHOOP Field | bnco Canonical Field | Used In |
|-------------|---------------------|---------|
| `muscular_strain` / `strain.muscular` | `muscularStrain` | Control Score, BTL Power |
| `total_strain` / `strain.total` | `totalStrain` | BTL Grit |
| `respiratory_rate` / `sleep.respiratory_rate` | `respiratoryRate` | Respiratory Score, BTL Flow |
| `hrv` / `recovery.hrv` | `hrv` | BTL Zen |
| `recovery_pct` / `recovery.score` | `recoveryPct` | BTL Zen, RES Recovery |
| `avg_hr` / `hr.average` | `avgHR` | BTL Power bonus, RES HR |
| `hr_zones` (object) | `hrZones` | BTL Flow |
| `active_calories` / `calories.active` | `activeCal` | BTL Power |
| `duration_ms` / `duration_seconds` | `durationMin` | Control Score, BTL Grit/Flow |
| `sport_id` | `workoutType` | Activity detection |

### 1.4 WHOOP Sport IDs (Pilates-Relevant)

| Sport ID | Activity Name | Notes |
|----------|--------------|-------|
| 63 | Pilates | Primary target |
| 71 | Barre | Closely related |
| 0 | Activity (generic) | May contain Pilates if user didn't tag correctly |
| 1 | Running | Not relevant but may trigger webhook |
| 43 | Yoga | Related modality |

**Current approach:** Accept all sport IDs at ingestion time. Filter/weight by activity type when computing BTL scores (see `biometrics_mapping.md`, section 3 for activity type detection and the 0.8x Power multiplier for generic labels).

### 1.5 Rate Limits

| Endpoint | Limit |
|----------|-------|
| OAuth token exchange | Standard OAuth limits |
| REST API (polling fallback) | 100 requests/hour per user |
| Webhooks (inbound) | No rate limit from WHOOP |

### 1.6 Polling Fallback

If a webhook is missed, we poll WHOOP every 15 minutes for recent activities:

```
GET https://api.prod.whoop.com/developer/v1/activity/workout
Authorization: Bearer {access_token}
```

Query by `start` and `end` timestamps. Deduplicate against existing `workout_sessions` by matching `whoop_user_id` + `recorded_at`.

### 1.7 Token Refresh

WHOOP access tokens expire after 1 hour. Before any polling request:

```
POST https://api.prod.whoop.com/oauth/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token={stored_refresh_token}
&client_id={WHOOP_CLIENT_ID}
&client_secret={WHOOP_CLIENT_SECRET}
```

Store the new `access_token` and `refresh_token` (WHOOP rotates refresh tokens).

---

## 2. Apple Watch / HealthKit

### 2.1 Architecture

Apple HealthKit data can only be accessed from an on-device iOS app. There is no cloud API. This means:

1. User installs the bnco iOS companion app (React Native with Expo)
2. App requests HealthKit permissions
3. During/after workouts, the app reads data from HealthKit and CoreMotion
4. App syncs data to bnco servers via REST API (`POST /api/workouts`)

### 2.2 Required Entitlements

The iOS app needs these capabilities in Xcode:

- **HealthKit** capability enabled
- **HealthKit Background Delivery** (for post-workout sync)
- **Motion & Fitness** usage description (for CoreMotion)

**Info.plist keys:**

```xml
<key>NSHealthShareUsageDescription</key>
<string>bnco reads your workout data to calculate your Precision Score and track your progress.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>bnco writes workout summaries back to Health for your records.</string>
<key>NSMotionUsageDescription</key>
<string>bnco uses motion data during Pilates workouts to calculate your Stillness Index.</string>
```

### 2.3 HealthKit Data Types

**Read permissions requested:**

| HealthKit Type | Identifier | Purpose |
|----------------|-----------|---------|
| Active Energy Burned | `HKQuantityTypeIdentifier.activeEnergyBurned` | BTL Power (calories) |
| Heart Rate | `HKQuantityTypeIdentifier.heartRate` | BTL Power bonus, RES HR |
| Heart Rate Variability | `HKQuantityTypeIdentifier.heartRateVariabilitySDNN` | BTL Zen, Respiratory Score context |
| Respiratory Rate | `HKQuantityTypeIdentifier.respiratoryRate` | Respiratory Score, BTL Flow |
| Workout Type | `HKWorkoutActivityType` | Activity detection |
| Workout Duration | `HKWorkout.duration` | Control Score, BTL Grit |

### 2.4 CoreMotion for Stillness Index

The Stillness Index is bnco's unique differentiator. It measures wrist/arm stability during Pilates exercises using the Apple Watch's accelerometer and gyroscope.

**Implementation:**

```swift
// CMMotionManager - sample at 50Hz during active workout
let motionManager = CMMotionManager()
motionManager.accelerometerUpdateInterval = 1.0 / 50.0  // 50Hz

motionManager.startAccelerometerUpdates(to: .main) { data, error in
    guard let accel = data?.acceleration else { return }
    // Track variance in x, y, z acceleration
    // Lower variance = more stability = higher Stillness Score
    recordStabilitySample(x: accel.x, y: accel.y, z: accel.z)
}
```

**Stillness calculation:**

```
stabilityVariance = variance(all_acceleration_samples) during workout
stillnessScore = (1 - clamp(stabilityVariance, 0, 1)) * 100
```

- Range: 0 (constant shaking) to 100 (perfectly still)
- Typical Pilates workout: 60-85
- Reformer with straps (wobbly): 40-65
- Mat work (stable): 70-90

**Key insight:** In Pilates, controlled movement with minimal wrist wobble indicates engaged core. The Apple Watch on the wrist acts as a proxy for core stability. Excessive movement in the straps = core disengagement = lower Stillness Score.

### 2.5 Data Sync Flow

```
1. User starts "Pilates" workout on Apple Watch (or bnco companion tags it)
2. During workout: CoreMotion samples accelerometer at 50Hz
3. On workout end:
   a. Read from HealthKit: calories, HR, HRV, respiratory rate, duration
   b. Aggregate CoreMotion data: compute stability_variance
   c. POST to /api/workouts with source="apple_watch"
4. Server computes Stillness Score + other available scores
```

### 2.6 Background Delivery

For users who forget to open the app, HealthKit Background Delivery can trigger a sync:

```swift
// Register for background delivery of new workouts
healthStore.enableBackgroundDelivery(
    for: HKObjectType.workoutType(),
    frequency: .immediate
) { success, error in
    // When a new workout is saved to HealthKit,
    // iOS wakes the app to sync
}
```

This requires the `HealthKit Background Delivery` entitlement and proper background mode configuration.

---

## 3. Terra API (Unified Layer)

### 3.1 What Terra Does

[Terra](https://tryterra.co/) provides a single API that aggregates data from 200+ wearable providers. Instead of maintaining individual integrations with WHOOP, Apple HealthKit, and Garmin, we can use Terra as a proxy.

**Providers relevant to bnco:**

| Provider | Terra Support | Data Available |
|----------|--------------|----------------|
| WHOOP | Full | Strain, HRV, recovery, respiratory, HR zones |
| Apple Watch | Full (via Terra iOS SDK) | Calories, HR, HRV, workouts |
| Garmin | Full | HR, calories, stress, body battery, respiration |
| Fitbit | Full | HR, calories, HRV (Premium), SpO2 |
| Oura | Full | HRV, sleep, readiness, temperature |

### 3.2 Setup Steps

1. **Create Terra account** at [dashboard.tryterra.co](https://dashboard.tryterra.co)
2. **Get API keys:** `x-api-key` and `dev-id`
3. **Generate widget session** for user onboarding:

```
POST https://api.tryterra.co/v2/auth/generateWidgetSession
Headers: x-api-key: {TERRA_API_KEY}, dev-id: {TERRA_DEV_ID}
Body: { "reference_id": "<bnco_user_id>", "providers": "WHOOP,APPLE,GARMIN" }
```

4. **User connects** their wearable through Terra's widget
5. **Configure webhook URL:** `https://api.bnco.app/api/webhooks/terra`

### 3.3 Terra Webhook Format

Terra sends standardized payloads regardless of the source provider:

```json
{
  "type": "activity",
  "user": {
    "user_id": "terra-user-id",
    "reference_id": "bnco-user-id",
    "provider": "WHOOP"
  },
  "data": [
    {
      "metadata": {
        "start_time": "2026-03-04T10:00:00.000Z",
        "end_time": "2026-03-04T10:50:00.000Z",
        "type": 63
      },
      "active_durations_data": {
        "activity_seconds": 3000
      },
      "calories_data": {
        "net_activity_calories": 420
      },
      "heart_rate_data": {
        "summary": {
          "avg_hr_bpm": 128,
          "max_hr_bpm": 155
        },
        "detailed": {
          "hr_samples": [...]
        }
      },
      "strain_data": {
        "strain_level": 14.8
      },
      "MET_data": {
        "avg_level": 5.2
      }
    }
  ]
}
```

### 3.4 Terra Webhook Verification

```javascript
const crypto = require('crypto');

function verifyTerraSignature(req) {
  const signature = req.headers['terra-signature'];
  const expected = crypto
    .createHmac('sha256', process.env.TERRA_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  return signature === expected;
}
```

### 3.5 Benefits of Terra Over Direct Integrations

| Aspect | Direct (WHOOP + Apple) | Terra |
|--------|----------------------|-------|
| Number of integrations to maintain | 2+ separate codepaths | 1 unified API |
| Adding Garmin/Fitbit/Oura | Build from scratch each time | Flip a switch |
| OAuth management | Per-provider token storage | Terra handles tokens |
| Webhook format | Different per provider | Standardized |
| Maintenance burden | High (API changes per provider) | Low (Terra abstracts) |
| Cost | Free (direct APIs) | Terra pricing tier |
| Latency | Direct, minimal | Extra hop through Terra |
| CoreMotion (Stillness) | Must build native iOS | Still need native for CoreMotion |

**Recommendation:** Use Terra for cloud-to-cloud data (WHOOP, Garmin, Fitbit). Keep the native iOS app for CoreMotion Stillness data, since Terra cannot access on-device sensor APIs.

---

## 4. Data Field Mapping Table

Cross-reference of which provider supplies which metric:

| bnco Metric | WHOOP (Direct) | WHOOP (via Terra) | Apple Watch | Garmin (via Terra) |
|-------------|---------------|-------------------|-------------|-------------------|
| Muscular Strain | `muscular_strain` | `strain_data.strain_level` | Not available | Not available |
| Total Strain | `total_strain` | `strain_data.strain_level` | Not available | Not available |
| Active Calories | `active_calories` | `calories_data.net_activity_calories` | `activeEnergyBurned` | `calories_data.net_activity_calories` |
| Avg Heart Rate | `avg_hr` | `heart_rate_data.summary.avg_hr_bpm` | `heartRate` (avg) | `heart_rate_data.summary.avg_hr_bpm` |
| HR Zones | `hr_zones` | Computed from HR samples | `heartRate` (zone bucketing) | Computed from HR samples |
| HRV (RMSSD) | `hrv` | `heart_rate_data.hrv` | `heartRateVariabilitySDNN` | `heart_rate_data.hrv` |
| Respiratory Rate | `respiratory_rate` | `respiration_data` | `respiratoryRate` | `respiration_data` |
| Recovery % | `recovery_pct` | Not directly available | Not available | Not available (use Body Battery as proxy) |
| Stability Variance | Not available | Not available | CoreMotion (on-device) | Not available |
| Duration | `duration_seconds` | `active_durations_data.activity_seconds` | `workout.duration` | `active_durations_data.activity_seconds` |
| Workout Type | `sport_id` | `metadata.type` | `HKWorkoutActivityType` | `metadata.type` |

---

## 5. Score Mapping by Provider

How each wearable maps to bnco's three scoring systems:

### 5.1 bnco Score (Pilates-Specific)

| Component | Weight | WHOOP | Apple Watch | Garmin |
|-----------|--------|-------|-------------|--------|
| Control Score | 40% | From muscular_strain + duration | Not available (weight redistributed) | Not available (weight redistributed) |
| Stillness Score | 35% | Not available (weight redistributed) | CoreMotion stability_variance | Not available (weight redistributed) |
| Respiratory Score | 25% | From respiratory_rate | From respiratoryRate (if available) | From respiration_data |

**WHOOP-only user:** bnco Score = weighted average of Control + Respiratory (normalized to 100%)
**Apple Watch-only user:** bnco Score = Stillness + Respiratory (normalized to 100%)
**Both devices:** Full composite with all three components

### 5.2 BTL Vibe Score

| Component | Weight | WHOOP | Apple Watch | Garmin |
|-----------|--------|-------|-------------|--------|
| Power | 30% | Full (strain + cal) | Partial (cal only) | Partial (cal only) |
| Flow | 25% | Full (HR zones + resp rate) | Partial (HR zones only) | Partial (HR zones only) |
| Grit | 25% | Full (duration + strain) | Partial (duration only) | Partial (duration only) |
| Zen | 20% | Full (HRV + recovery) | Partial (HRV only) | Partial (HRV only) |

### 5.3 RES (Relative Effort Score)

| Component | Weight | WHOOP | Apple Watch | Garmin |
|-----------|--------|-------|-------------|--------|
| Strain | 35% | From total_strain | Not available | Not available |
| HR | 25% | From avg_hr | From heartRate | From avg_hr |
| Steps | 20% | Not typical | From stepCount | From step_data |
| Recovery | 20% | From recovery_pct | Not available | Body Battery as proxy |

---

## 6. Fallback Strategies

### 6.1 Missing Data - Weight Redistribution

When a metric is `null` because the device doesn't provide it, we drop that component and re-normalize:

```javascript
const active = scores.filter(s => s.value !== null);
const totalWeight = active.reduce((sum, s) => sum + s.weight, 0);
const composite = active.reduce((sum, s) => sum + (s.weight / totalWeight) * s.value, 0);
```

This is implemented in `scoring.service.js` for all three scoring systems.

### 6.2 Cold Start (New User, < 7 Days)

For RES baseline-relative scoring:

| Days of Data | Baseline Strategy |
|-------------|-------------------|
| 0-2 days | Use population median for user's age band |
| 3-6 days | Use available-day average |
| 7+ days | Normal 7-day rolling EWMA (alpha = 0.3) |

Population medians by age band are defined in `scoring_math.md` section 5.2.

### 6.3 Device Switching

When a user connects a new device:
- Retain existing baselines for overlapping metrics (e.g., heart rate)
- Apply cold-start logic for new-only metrics (e.g., Garmin Body Battery)
- Never mix raw values across devices for the same metric - re-baseline after switching

### 6.4 Single-Device Partial Scores

| Scenario | bnco Score | BTL Vibe Score | RES |
|----------|-----------|---------------|-----|
| WHOOP only | Control + Respiratory (2 of 3) | All 4 categories | Strain + HR + Recovery (3 of 4) |
| Apple Watch only | Stillness + Respiratory (2 of 3) | Power + Flow + Grit + Zen (all partial) | HR only (1 of 4) |
| Both devices | Full composite (all 3) | All 4 with maximum data richness | Most complete |
| Garmin only (via Terra) | Respiratory only (1 of 3) | Power + Flow + Grit + Zen (all partial) | HR + Steps (2 of 4) |

### 6.5 Polling Fallback for Webhooks

If WHOOP or Terra webhooks fail:

```
Webhook missed -> 15 min polling cycle checks for new activities
-> Deduplication by (user_id, recorded_at) composite
-> Process any new activities found
```

Polling runs as a background cron job on the server.

---

## 7. Reference Documents

For detailed scoring formulas and worked examples:

- **`references/scoring_math.md`** - RES (Relative Effort Score) algorithm with age normalization, sub-score functions, edge cases, XP scaling, and streak multipliers
- **`references/biometrics_mapping.md`** - BTL (Biometric Translation Layer) field mappings from WHOOP and Apple HealthKit, with worked examples for both device types and cross-device normalization rules
- **`references/geo_logic.md`** - Geo-tiered leaderboard logic (city/state/country/global)
- **`references/studio_api.md`** - Studio dashboard API spec including missions, analytics, and webhook events

---

## 8. Implementation Checklist

| Task | Status | Priority |
|------|--------|----------|
| WHOOP OAuth flow (auth URL + callback) | Coded | High - needs testing |
| WHOOP webhook handler | Coded | High - needs testing |
| WHOOP token refresh logic | Todo | High |
| WHOOP polling fallback (cron) | Todo | Medium |
| iOS companion app (React Native/Expo) | Todo | High - blocks Apple Watch |
| HealthKit permissions + data read | Todo | High |
| CoreMotion stability sampling (50Hz) | Todo | High - unique differentiator |
| HealthKit Background Delivery | Todo | Medium |
| Terra account setup | Todo | Medium |
| Terra widget integration | Todo | Medium |
| Terra webhook handler | Todo | Medium |
| Garmin via Terra | Todo | Low (Phase 2+) |
| Fitbit via Terra | Todo | Low (Phase 3+) |
