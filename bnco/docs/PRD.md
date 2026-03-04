# bnco Product Requirements Document (PRD)

## 1. Vision

bnco is a High-Performance Social Layer for the Pilates industry. By leveraging "Muscular Load" and "Stability" data from WHOOP and Apple Watch, we create a gamified B2B2C platform where studios compete and athletes reach personal "Precision Peaks."

---

## 2. The "bnco" Differentiator: Core-Centric Metrics

Generic apps track "Steps" or "Calories." bnco focuses on the Powerhouse.

### 2.1 Control Score (WHOOP Muscular Load)
- **Source**: WHOOP Developer API - "Strength Trainer" accelerometer data
- **Metric**: Calculates ratio of controlled eccentric movement vs. momentum
- **Range**: 0-100 (higher = more controlled)
- **Use Case**: Measures how "Pilates-correct" the workout was

### 2.2 Stillness Index (Apple Watch Stability)
- **Source**: Apple Core Motion API (CMMotionManager)
- **Metric**: Tracks wrist/arm motion variance during exercises
- **Range**: 0-100 (higher = more stable)
- **Key Insight**: In Pilates, "wobble" in the straps indicates core disengagement
- **Implementation**: Real-time accelerometer + gyroscope sampling during tagged exercises

### 2.3 Respiratory Efficiency
- **Source**: Respiratory Rate from both WHOOP and Apple Watch HealthKit
- **Metric**: Detects breath-holding during high-load movements
- **Range**: 0-100 (higher = better breath integration)
- **Key Insight**: Pilates is centered on breath. Holding breath during the Teaser = low score

### 2.4 Composite bnco Score (0-100)
- Weighted aggregate: Control (40%) + Stillness (35%) + Respiratory (25%)
- Posted to Studio leaderboard after each class
- Tracks over time for personal "Precision Growth" charts

---

## 3. B2B Strategy: The Studio "War Room"

Studios need community-building tools that don't burden instructors with manual tracking.

### 3.1 Weekly Studio "Tension" Goals
- Studio sets a weekly target (e.g., "30,000 Cumulative Muscular Load Units")
- Every device-wearing member contributes to a "Global Progress Bar"
- Displayed on:
  - Studio lobby TV (via Lobby Feed)
  - In-app studio page
- Resets weekly, with historical tracking

### 3.2 The "Precision" Leaderboard
- **NOT** "who burned the most calories" (anti-Pilates)
- Ranks members by: Consistency Score + Stability Score
- Rewards the most "precise" athlete, not the most athletic
- Weekly and monthly views
- Opt-in (athletes can choose to appear or stay private)

### 3.3 Studio-to-Studio Challenges ("Precision Wars")
- Studios challenge each other: "bnco Cincinnati vs. bnco Miami"
- Metric: Average Stability Score per class across all participating members
- Duration: 1-4 weeks
- Winner gets in-app badge + bragging rights display on Lobby Feed

---

## 4. Technical Integration: The Connect Layer

Cloud-to-Cloud sync strategy for minimum user friction.

### 4.1 WHOOP Integration
- **Method**: WHOOP Developer API (REST + Webhooks)
- **Auth**: OAuth 2.0 (user authenticates once)
- **Data Flow**:
  1. User completes a "Pilates" tagged activity on WHOOP
  2. WHOOP fires webhook to bnco servers
  3. Payload includes: `muscular_strain`, `hrv_impact`, `respiratory_rate`, `activity_duration`
  4. bnco engine processes into Control Score
- **Polling Fallback**: If webhook fails, poll every 15 min for recent activities

### 4.2 Apple Watch / HealthKit Integration
- **Method**: HealthKit SDK (on-device) + Core Motion API
- **Auth**: HealthKit permission request (one-time)
- **Data Flow**:
  1. User starts a "Pilates" workout on Apple Watch (or bnco companion app tags it)
  2. During workout: Core Motion samples accelerometer/gyroscope at 50Hz for Stillness
  3. Post-workout: iOS app pulls from HealthKit:
     - `HKQuantityTypeIdentifier.activeEnergyBurned`
     - `HKQuantityTypeIdentifier.heartRateVariabilitySDNN`
     - `HKQuantityTypeIdentifier.respiratoryRate`
     - Core Motion aggregate stability data
  4. Data synced to bnco servers via REST API

### 4.3 The bnco Engine (Server-Side)
- Receives raw data from both sources
- Normalizes and weights into bnco Score (0-100)
- Posts score to:
  - User's personal history
  - Studio's private leaderboard (if user is associated with a studio)
  - Studio's weekly Tension Goal progress

---

## 5. Product Interfaces

### 5.1 Consumer App (B2C) - React Native iOS
**Target User**: Individual Pilates athlete

**Features**:
- Personal dashboard with bnco Score history
- "Precision Growth" trend charts (daily/weekly/monthly)
- Connect WHOOP and/or Apple Watch (one or both)
- Join a studio (via invite code or search)
- View studio leaderboard (opt-in)
- View studio weekly goal and personal contribution
- Achievement badges ("First 90+ Score", "10 Class Streak", "Precision Peak")
- Settings: Privacy controls, device connections, studio membership

**Auth**: Email/password or Apple Sign-In

### 5.2 Studio Dashboard (B2B) - Next.js Web App
**Target User**: Studio owner/manager

**Features**:
- Member management (invite, remove, view individual progress)
- Set weekly "Tension Goals"
- View Precision Leaderboard
- "At Risk" alerts: Members with declining scores, low recovery, or high strain patterns
- Challenge management: Create and manage Studio-to-Studio challenges
- Analytics: Class-by-class average scores, peak hours, retention metrics
- Lobby Feed management: Customize what appears on the TV display
- Settings: Studio profile, branding, notification preferences

**Auth**: Email/password with studio admin role

### 5.3 Lobby Feed - Next.js Web Page
**Target**: Studio TV displays

**Features**:
- Real-time weekly goal progress bar (animated)
- "Athlete of the Week" spotlight
- Active Studio-to-Studio challenge scoreboard
- Recent class highlights (top scores)
- Auto-refreshes, designed for 1080p landscape display
- Configurable via Studio Dashboard
- Accessible via unique studio URL (e.g., `lobby.bnco.app/studio-slug`)

**Auth**: URL-based with optional PIN protection

---

## 6. Data Models (Core)

### User
- id, email, name, avatar
- role: "athlete" | "studio_admin" | "studio_staff"
- connected_devices: [whoop, apple_watch]
- studio_memberships: [studio_id]

### Studio
- id, name, slug, city, state
- owner_id (user)
- members: [user_id]
- weekly_tension_goal: number
- branding: { logo_url, accent_color }

### WorkoutSession
- id, user_id, studio_id (nullable)
- timestamp, duration_minutes
- source: "whoop" | "apple_watch" | "both"
- raw_data: { muscular_load, stability_variance, respiratory_rate, hrv }
- control_score, stillness_score, respiratory_score, bnco_score

### StudioChallenge
- id, challenger_studio_id, defender_studio_id
- start_date, end_date
- metric: "avg_stability" | "avg_bnco_score"
- status: "pending" | "active" | "completed"
- winner_studio_id (nullable)

### WeeklyGoal
- id, studio_id, week_start
- target_load_units: number
- current_load_units: number
- contributing_members: [user_id]

---

## 7. API Endpoints (Connect Layer)

### Auth
- `POST /api/auth/register` - Create account (athlete or studio)
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh JWT

### Users
- `GET /api/users/me` - Get profile
- `PATCH /api/users/me` - Update profile
- `POST /api/users/me/devices/whoop` - Connect WHOOP (OAuth redirect)
- `POST /api/users/me/devices/apple` - Confirm Apple Watch connection

### Workouts
- `POST /api/workouts` - Submit workout data (from app or webhook)
- `GET /api/workouts/me` - My workout history
- `GET /api/workouts/me/stats` - My aggregated stats (weekly/monthly/all-time)

### Studios
- `POST /api/studios` - Create studio
- `GET /api/studios/:id` - Get studio info
- `POST /api/studios/:id/join` - Join studio (invite code)
- `GET /api/studios/:id/leaderboard` - Precision Leaderboard
- `GET /api/studios/:id/goal` - Current weekly goal progress
- `POST /api/studios/:id/goal` - Set weekly goal (admin only)
- `GET /api/studios/:id/members` - List members (admin only)
- `GET /api/studios/:id/at-risk` - At-risk members (admin only)

### Challenges
- `POST /api/challenges` - Create challenge
- `GET /api/challenges/:id` - Challenge details
- `PATCH /api/challenges/:id/accept` - Accept challenge

### Lobby Feed
- `GET /api/lobby/:studio_slug` - Lobby feed data (public, rate-limited)

### Webhooks
- `POST /api/webhooks/whoop` - WHOOP workout completion webhook

---

## 8. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Consumer App | React Native (iOS first) | Expo managed workflow |
| Studio Dashboard | Next.js 14 (App Router) | Server components + API routes |
| Lobby Feed | Next.js 14 | SSE for real-time updates |
| API / Connect Layer | Node.js + Express | REST API, webhook handlers |
| Database | PostgreSQL | Primary data store |
| Cache / Real-time | Redis | Leaderboard caching, pub/sub for lobby |
| Auth | JWT + bcrypt | Separate athlete/studio flows |
| WHOOP | WHOOP Developer API | OAuth 2.0 + Webhooks |
| Apple Watch | HealthKit SDK + Core Motion | On-device, synced via iOS app |
| Hosting | Vercel (web) + Railway (API) | Or similar PaaS |
| File Storage | S3 / Cloudflare R2 | Avatars, studio logos |

---

## 9. Phase 1 MVP Scope

**Goal**: Launch with core scoring + studio leaderboard. Validate that studios will adopt it.

### In Scope (Phase 1)
- Athlete signup + Apple Watch connection (HealthKit)
- bnco Score calculation (simplified: Stability + Respiratory only)
- Studio creation + member management
- Precision Leaderboard
- Weekly Tension Goals with progress bar
- Basic Lobby Feed (goal progress + leaderboard)
- Studio Dashboard (members, goals, leaderboard)

### Phase 2
- WHOOP integration (full Control Score)
- Studio-to-Studio Challenges
- Achievement badges and streaks
- "At Risk" member alerts
- Enhanced analytics

### Phase 3
- Android support
- Instructor-facing features (class tagging, form feedback)
- API for third-party studio management software
- Wearable companion app (Apple Watch native)
