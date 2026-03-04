# bnco Product Roadmap

**Last Updated:** 2026-03-04

---

## Phase 1: MVP - Core Scoring + Studio Leaderboard

**Timeline:** Feb 2026 - Apr 2026 (current phase)
**Goal:** Validate that studios will adopt a wearable-powered precision scoring platform.

### Milestones

| Milestone | Target Date | Status |
|-----------|------------|--------|
| Backend API complete (all routes) | Feb 2026 | Done |
| Scoring engine (bnco + BTL + RES) | Feb 2026 | Done |
| Database schema + migrations | Feb 2026 | Done |
| Static frontend demo on Netlify | Feb 2026 | Done |
| Frontend-API integration | Mar 2026 | In Progress |
| Auth UI (login/register/Google) | Mar 2026 | In Progress |
| Athlete onboarding flow UI | Mar 2026 | In Progress |
| Backend deployment (Railway/Fly.io) | Mar 2026 | Todo |
| WHOOP OAuth testing with real device | Mar 2026 | Todo |
| Lobby feed MVP (SSE-connected) | Apr 2026 | Todo |
| First studio pilot (1-2 studios) | Apr 2026 | Todo |

### What Ships

- Athlete signup + Google OAuth
- Athlete onboarding (studio selection, frequency, device preference)
- Workout submission with automatic scoring
- Studio creation + member management
- Precision Leaderboard (weekly/monthly, opt-in)
- Weekly Tension Goals with progress bar
- Basic Lobby Feed (goal progress + leaderboard + highlights)
- WHOOP webhook ingestion
- Manual member approval

### What Doesn't Ship

- iOS companion app (no Stillness Score from CoreMotion)
- Studio-to-studio challenges (backend done, UI not)
- At-risk alerts UI (backend done, dashboard not)
- Billing integration testing (Stripe/MindBody/Mariana Tek)
- Terra API integration
- Badges and achievements

---

## Phase 2: WHOOP Full Integration + Studio Challenges + Badges

**Timeline:** May 2026 - Jul 2026
**Goal:** Complete the WHOOP integration, ship engagement features, and onboard 10+ studios.

### Milestones

| Milestone | Target Date |
|-----------|------------|
| WHOOP OAuth live in production | May 2026 |
| WHOOP token refresh + polling fallback | May 2026 |
| Studio-to-studio challenges UI | May 2026 |
| Achievement badge system | Jun 2026 |
| Studio Dashboard (Next.js) v1 | Jun 2026 |
| At-risk member alerts in dashboard | Jun 2026 |
| Billing integration (Stripe live) | Jun 2026 |
| MindBody/Mariana Tek integration testing | Jul 2026 |
| Terra API integration (adds Garmin) | Jul 2026 |
| 10 studio pilots running | Jul 2026 |

### What Ships

- **WHOOP full pipeline:** OAuth -> webhook -> scoring -> leaderboard, with token refresh and polling fallback
- **Studio Challenges:** Create, accept, track, and display on lobby feed
- **Achievement Badges:** First 90+ Score, 10 Class Streak, Precision Peak, etc.
- **Studio Dashboard v1:** Next.js admin app with member management, pending approvals, leaderboard controls, goal setter, at-risk alerts
- **Billing auto-approval:** Stripe integration live; MindBody/Mariana Tek in testing
- **Terra API:** Unified wearable layer adds Garmin support alongside WHOOP
- **Enhanced Lobby Feed:** Challenge scoreboard, badge announcements, richer animations

### Key Metrics

- 10+ studios actively using the platform
- 500+ athletes with connected wearables
- Average 3+ sessions/week per active athlete
- Studio retention: 90%+ month-over-month

---

## Phase 3: iOS Companion App + Android

**Timeline:** Aug 2026 - Dec 2026
**Goal:** Ship the iOS app to unlock Apple Watch data (Stillness Score), then port to Android.

### Milestones

| Milestone | Target Date |
|-----------|------------|
| React Native (Expo) project setup | Aug 2026 |
| HealthKit integration (read permissions) | Aug 2026 |
| CoreMotion stability sampling (50Hz) | Sep 2026 |
| Stillness Score live in production | Sep 2026 |
| iOS app v1 (auth, dashboard, device connect) | Oct 2026 |
| Apple App Store submission | Oct 2026 |
| HealthKit Background Delivery | Nov 2026 |
| Android port (React Native) | Nov 2026 |
| Google Play Store submission | Dec 2026 |
| Full three-component bnco Score live | Dec 2026 |

### What Ships

- **iOS companion app:** React Native with Expo, featuring auth, personal dashboard, workout history, device management, and studio discovery
- **Stillness Score:** CoreMotion-powered stability measurement - bnco's key differentiator
- **Full bnco Score:** All three components (Control + Stillness + Respiratory) for users with both devices
- **Background sync:** HealthKit Background Delivery ensures workouts sync even if the app isn't open
- **Android app:** Same feature set, React Native shared codebase
- **Push notifications:** Workout reminders, challenge updates, badge earned, at-risk nudges

### Key Metrics

- 50+ studios
- 5,000+ athletes
- iOS App Store rating: 4.5+
- Average Stillness Score improvement over 30 days per athlete

---

## Phase 4: Instructor Features + Third-Party API + White-Label

**Timeline:** Jan 2027 - Jun 2027
**Goal:** Build the instructor layer, open the platform to third-party developers, and offer white-label for studio chains.

### Milestones

| Milestone | Target Date |
|-----------|------------|
| Instructor role + class tagging | Jan 2027 |
| Class-level analytics (per-class avg scores) | Feb 2027 |
| Form feedback prototype (instructor notes per member) | Feb 2027 |
| Third-party API (developer portal) | Mar 2027 |
| API documentation + rate limiting + API keys | Mar 2027 |
| White-label lobby feed (custom branding) | Apr 2027 |
| Multi-location studio management | Apr 2027 |
| Advanced analytics (retention curves, peak hours, instructor comparison) | May 2027 |
| White-label mobile app (custom App Store listing) | Jun 2027 |

### What Ships

- **Instructor Features:**
  - Instructors can tag classes in real-time
  - Post-class summary: avg scores, standout members, areas to watch
  - Form feedback: instructors add notes per member per class ("Work on breath control in Teaser")
  - Class comparison: which class format produces the best scores

- **Third-Party API:**
  - Developer portal with API key management
  - Webhooks for third-party studio management software
  - Events: workout.completed, member.leveled_up, streak.broken, city_rank.changed
  - Rate-limited, documented, versioned

- **White-Label:**
  - Studios can customize the lobby feed with full branding (logo, colors, layout)
  - Studio chains get multi-location management from a single admin account
  - White-label mobile app: custom App Store listing with studio branding
  - Custom domain for lobby feed (e.g., `lobby.corepowerpilates.com`)

- **Advanced Analytics:**
  - Retention curves (when do members typically churn?)
  - Peak hours analysis (which time slots have highest engagement?)
  - Instructor comparison (which instructor's classes produce the best scores?)
  - Revenue correlation (do higher-scoring members have higher LTV?)

### Key Metrics

- 200+ studios
- 25,000+ athletes
- Third-party API: 10+ integrations
- White-label: 5+ studio chains
- Monthly recurring revenue target: $50K+

---

## Long-Term Vision (2027+)

| Initiative | Description |
|-----------|-------------|
| AI Coach | Personalized workout recommendations based on scoring trends and recovery data |
| Live Class Mode | Real-time score display during class (instructor tablet view) |
| Insurance/Wellness Partnerships | Studios offer bnco-verified attendance for employer wellness programs |
| International Expansion | Multi-language support, region-specific studio discovery |
| Apple Watch Native App | Standalone watchOS app for real-time Stillness Score during class |
| Social Features | Follow athletes, share milestones, community challenges beyond studios |

---

## Guiding Principles

1. **Studios first.** Studios are the distribution channel. Make them successful and athletes follow.
2. **Precision over intensity.** bnco rewards controlled, mindful movement - not who sweats the most.
3. **Privacy by default.** Raw biometrics stay private. Only processed scores are shared.
4. **Works passively.** No instructor burden. No manual data entry. Wearable data flows automatically.
5. **Fair competition.** Baseline-relative scoring means a beginner and an advanced athlete can compete meaningfully.
