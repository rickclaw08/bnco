# bnco Project Status

**Last Updated:** 2026-03-04
**Current Phase:** Phase 1 MVP
**Overall Status:** Backend complete, Frontend integration in progress

---

## Phase 1 MVP Feature Checklist

### Backend (Connect Layer)

| Feature | Status | Notes |
|---------|--------|-------|
| Auth - Email/Password register & login | Done | bcrypt hashing, JWT tokens, 7d expiry |
| Auth - Google OAuth sign-in/sign-up | Done | google-auth-library verification |
| Auth - Token refresh | Done | Accepts expired tokens, issues new |
| Onboarding - Athlete flow (frequency, studios, devices) | Done | Auto-billing verification stubs in place |
| Onboarding - Studio search | Done | ILIKE search by name/city |
| Onboarding - Status check | Done | Returns completion state + memberships |
| Workouts - Submit with scoring | Done | bnco Score, BTL Vibe Score, RES all computed |
| Workouts - History (paginated) | Done | Limit/offset, ordered by recorded_at DESC |
| Workouts - Stats (weekly/monthly/all-time) | Done | Aggregates + trend (last 10 sessions) |
| Studios - Create with slug | Done | Auto-joins owner, updates role to studio_admin |
| Studios - Get info (public) | Done | Includes member count and owner name |
| Studios - Join (pending membership) | Done | Creates pending membership request |
| Studios - Precision Leaderboard | Done | AVG bnco_score, weekly/monthly, opt-in only |
| Studios - Weekly Tension Goals (get/set) | Done | Upsert on conflict, progress percentage |
| Studios - List members (admin) | Done | With 30-day avg score |
| Studios - At-risk members (admin) | Done | 14-day inactivity OR 20%+ score decline |
| Memberships - Pending requests list | Done | Admin-only, ordered by requested_at |
| Memberships - Approve/Deny | Done | Updates status, sets verified_via |
| Memberships - Billing integration config | Done | Stripe/MindBody/Mariana Tek (stubs) |
| Memberships - Members by status filter | Done | pending/active/denied/expired |
| Challenges - Create studio-to-studio | Done | Validates ownership, prevents self-challenge |
| Challenges - Get details | Done | Joins both studio names and slugs |
| Challenges - Accept (defender only) | Done | Status transition: pending -> active |
| Lobby - Feed data (public) | Done | Goal progress, AOTW, leaderboard, challenges, highlights |
| Lobby - SSE real-time stream | Done | Redis pub/sub, 30s heartbeat |
| Webhooks - WHOOP workout ingestion | Done | Signature verification, auto-scoring, goal update |
| Scoring Engine - bnco Score | Done | Control (40%) + Stillness (35%) + Respiratory (25%) |
| Scoring Engine - BTL Vibe Score | Done | Power (30%) + Flow (25%) + Grit (25%) + Zen (20%) |
| Scoring Engine - RES | Done | Baseline-relative, age-normalized |
| Database Migrations | Done | 3 migration files (initial, onboarding, password fix) |
| Middleware - JWT auth | Done | Bearer token extraction and verification |
| Middleware - Role check | Done | requireRole() for admin-gated endpoints |
| Health check endpoint | Done | GET /health |

### Frontend

| Feature | Status | Notes |
|---------|--------|-------|
| Static demo app (Vite) | Done | Deployed to Netlify, dark Pilates aesthetic |
| BTL visualization (btl.js) | Done | Power/Flow/Grit/Zen category display |
| Leaderboard UI | Done | Ghost racing, achievements, missions in demo |
| API integration layer | In Progress | Needs fetch/axios client wired to connect-layer |
| Auth UI (login/register forms) | In Progress | Google OAuth button + email/password forms needed |
| Onboarding UI (athlete flow) | In Progress | Studio search, frequency picker, device connect |
| Lobby page (TV display) | In Progress | Needs SSE connection, auto-refresh, 1080p layout |
| Studio Dashboard | Todo | Next.js app for studio admins |
| Consumer App (React Native) | Todo | Phase 2/3 |

### Infrastructure

| Feature | Status | Notes |
|---------|--------|-------|
| Netlify frontend deployment | Done | Site ID: 7b9aae37-a1af-4244-8cd3-e2522c38536e |
| PostgreSQL schema | Done | All tables defined with indexes |
| Redis pub/sub setup | Done | Studio update channels for lobby |
| Docker containerization | In Progress | Dockerfile exists, needs docker-compose for full stack |
| Railway/Fly.io backend deploy | Todo | Connect-layer needs cloud deployment |
| CI/CD pipeline | In Progress | Needs GitHub Actions workflow for test + deploy |
| Environment config (.env.example) | Done | All vars documented |

### Wearable Integrations

| Feature | Status | Notes |
|---------|--------|-------|
| WHOOP OAuth flow | Coded, Untested | Auth URL generation, code exchange, token storage |
| WHOOP webhook handler | Coded, Untested | Signature verification, workout processing |
| WHOOP token refresh | Todo | Need to handle expired access tokens |
| Apple HealthKit integration | Needs iOS App | Requires React Native companion app |
| Terra API (unified wearable layer) | Not Started | Would replace direct WHOOP + add Garmin |

---

## Blockers

1. **No backend deployment** - Connect-layer runs locally only. Need Railway or Fly.io setup to test end-to-end with the Netlify frontend.
2. **WHOOP OAuth untested** - Have the code but no live WHOOP Developer API credentials configured. Need a WHOOP developer account and test device.
3. **Apple HealthKit requires iOS app** - The Stillness Index (Core Motion accelerometer/gyroscope data) can only come from an on-device iOS app. No way around this without building the React Native companion app.
4. **Billing integration stubs** - Stripe, MindBody, and Mariana Tek auto-verification functions are stubbed. Need API keys and sandbox accounts to implement.
5. **No test suite** - Zero automated tests. Backend routes are untested beyond manual verification.
6. **Frontend-backend gap** - The Vite demo app has all the UI but doesn't talk to the API yet. Needs an API client layer and auth state management.

---

## Next Steps (Priority Order)

1. **Deploy backend to Railway/Fly.io** - Get the connect-layer live with a hosted PostgreSQL and Redis instance. This unblocks everything else.
2. **Wire frontend to API** - Build a fetch/axios client in the Vite app. Start with auth (register/login) and workout submission.
3. **Set up CI/CD** - GitHub Actions: lint, test (once tests exist), build, deploy to Railway + Netlify.
4. **WHOOP developer account** - Register on developer.whoop.com, get client credentials, test OAuth flow end-to-end.
5. **Write backend tests** - At minimum: auth routes, scoring engine, workout submission. Use Jest + supertest.
6. **Studio Dashboard MVP** - Build the Next.js admin dashboard. Members list, pending approvals, leaderboard view, weekly goal setter.
7. **Lobby Feed polish** - SSE-connected TV display with auto-refresh, branded with studio accent color.

---

## Architecture Health

- **Code quality:** Consistent patterns across all route files. Joi validation on inputs. Proper error handling with next(err).
- **Security:** bcrypt (12 rounds), JWT auth, WHOOP webhook signature verification, role-based access control.
- **Scoring:** Three independent scoring systems (bnco Score, BTL Vibe Score, RES) all implemented with graceful null handling and weight redistribution for missing data.
- **Real-time:** Redis pub/sub for lobby SSE updates on workout submissions.
- **Database:** Well-indexed PostgreSQL with UUID primary keys, proper foreign keys, and constraints.
