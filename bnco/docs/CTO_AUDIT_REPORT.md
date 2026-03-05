# BNCO Technical Audit Report

**Auditor:** Ethan (CTO)
**Date:** 2026-03-04
**Scope:** Full-stack audit - Frontend (Vite + vanilla JS), Backend (Node/Express), Infra (Fly.io)
**Live:** https://bnco.studio / https://bnco-api.fly.dev

---

## Executive Summary

The BNCO stack is functional and demonstrates solid fundamentals: parameterized SQL queries throughout, bcrypt password hashing, proper JWT verification, Joi input validation, helmet, and a clean multi-stage Dockerfile. However, there are several critical and high-severity issues, primarily around hardcoded API keys in the frontend, the token refresh endpoint accepting expired tokens with no blacklist, missing rate limiting on auth endpoints, and unencrypted storage of third-party API keys in the database.

**Findings by severity:**
- CRITICAL: 4
- HIGH: 8
- MEDIUM: 10
- LOW: 6

---

## 1. Security

### CRITICAL-01: Hardcoded Google Client ID in Frontend Source

**File:** `app/auth.js`, line 264
**What:** The Google OAuth Client ID is hardcoded as a fallback string directly in the source code:
```js
const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID || '912618975610-b36sq6pqjfgkme3j2c99im002jglpb5q.apps.googleusercontent.com';
```
**Risk:** While Client IDs are semi-public (they appear in the browser regardless), hardcoding them bypasses environment-based configuration, making it easy to accidentally deploy with wrong credentials or difficult to rotate. More importantly, this pattern encourages hardcoding actual secrets.
**Fix:** Remove the fallback. Require `VITE_GOOGLE_CLIENT_ID` to be set at build time. Fail visibly if missing.

---

### CRITICAL-02: Hardcoded Google Places API Key in Frontend Source

**File:** `app/onboarding.js`, line 9
**What:** A Google Places API key is hardcoded directly in the frontend source:
```js
const PLACES_API_KEY = import.meta.env?.VITE_PLACES_API_KEY || 'AIzaSyDp8gHtmxcJ5tnsmUz7YDm8wwpR3qJXBgs';
```
**Risk:** This is a billable API key. Anyone can view page source, extract it, and rack up charges against your Google Cloud account. Unlike Client IDs, API keys should never be exposed to the client unprotected.
**Fix:** Proxy Places API calls through your backend. The frontend should call your own `/api/places/search` endpoint, and the backend makes the Google Places call with the key stored in environment variables. Alternatively, restrict the API key to specific referrer domains in GCP console immediately as a stopgap.

---

### CRITICAL-03: Token Refresh Accepts Expired Tokens Without Blacklist

**File:** `src/connect-layer/src/routes/auth.routes.js`, lines 131-152
**What:** The `/auth/refresh` endpoint uses `jwt.verify(oldToken, secret, { ignoreExpiration: true })`. This means any previously valid JWT, no matter how old, can be used to mint a fresh token forever. There is no token blacklist, no refresh token rotation, and no family tracking.
```js
const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
```
**Risk:** If a token is ever leaked or stolen, the attacker can use it to generate new valid tokens indefinitely. This completely defeats token expiration.
**Fix:**
1. Implement proper refresh tokens (separate opaque token stored in DB with expiry and rotation).
2. Remove `ignoreExpiration: true` from the refresh logic.
3. Invalidate old refresh tokens on use (rotation).
4. Add a `refresh_tokens` table tracking token family, expiry, and revocation status.

---

### CRITICAL-04: Billing API Keys Stored Unencrypted

**File:** `src/connect-layer/src/routes/membership.routes.js`, lines 90-108
**What:** The billing integration endpoint stores API keys directly in the database without encryption:
```js
// In production: encrypt api_key before storing
const result = await pool.query(
  `INSERT INTO studio_billing_integrations ... VALUES ($1, $2, $3, $4)`,
  [studioId, provider, api_key, api_endpoint] // TODO: encrypt api_key
);
```
There is a `TODO` comment acknowledging this, but it is deployed as-is.
**Risk:** A database breach exposes all third-party billing API keys (Stripe, MindBody, Mariana Tek) in plaintext.
**Fix:** Encrypt API keys before storing using `aes-256-gcm` with a server-side encryption key from environment variables. Decrypt only when needed for API calls.

---

### HIGH-01: No Rate Limiting on Auth Endpoints

**Files:** `src/connect-layer/src/index.js`, `src/connect-layer/src/routes/auth.routes.js`
**What:** There is no rate limiting on `/api/auth/login`, `/api/auth/register`, `/api/auth/google`, or `/api/auth/refresh`. The `express-rate-limit` package is not imported or used anywhere.
**Risk:** Brute-force attacks on login, credential stuffing, and abuse of registration.
**Fix:**
```js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: 'Too many attempts. Try again later.' },
});

app.use('/api/auth', authLimiter);
```

---

### HIGH-02: WHOOP Tokens Stored in Plaintext

**File:** `src/connect-layer/src/routes/user.routes.js`, lines ~170-185
**What:** WHOOP OAuth access tokens and refresh tokens are stored directly in the `users` table columns `whoop_token` and `whoop_refresh_token` without encryption.
**Risk:** Database breach exposes WHOOP API tokens for all users, allowing impersonation of their WHOOP accounts.
**Fix:** Encrypt tokens at rest using the same encryption approach recommended for billing keys.

---

### HIGH-03: XSS Risk via innerHTML with User-Controlled Data

**Files:** `app/main.js` (lines 904, 1405, 1774), `app/settings.js` (lines 98, 103, 106, 155)
**What:** Several places use `innerHTML` with user-controlled data:
- `el.innerHTML = '<img src="' + pfp + '"...'` where `pfp` comes from `user.avatar_url` or `localStorage`
- Leaderboard table rows built from API response data injected via `innerHTML`
- Last workout info rendered via `innerHTML` with API data

**Risk:** If an attacker can control `avatar_url` (via API manipulation or a compromised Google profile with a crafted URL), they can inject HTML/JS. Example: an `avatar_url` of `" onerror="alert(1)" data-x="` would execute JavaScript.
**Fix:** Use `textContent` for text, create elements programmatically with `document.createElement`, or use a sanitization library. For images, validate URL format server-side (must start with `https://` and match known image domains).

---

### HIGH-04: CORS Allows Only Single Origin

**File:** `src/connect-layer/src/index.js`, line 24
**What:**
```js
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
```
This only allows one origin. If `FRONTEND_URL` is set to `https://bnco.studio`, then `http://localhost:5173` (local dev) won't work, and vice versa.
**Risk:** Development friction and potential misconfiguration. If set too broadly (e.g., `*`), it becomes a security issue.
**Fix:** Use an array of allowed origins:
```js
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.NODE_ENV !== 'production' && 'http://localhost:5173',
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
```

---

### HIGH-05: No CSRF Protection

**Files:** All backend routes
**What:** No CSRF token validation on any mutating endpoint. The app uses Bearer tokens in Authorization headers (not cookies), which naturally mitigates CSRF for API calls. However, the Google OAuth callback (`/me/devices/whoop/callback`) uses query parameters and redirects, which are vulnerable.
**Risk:** CSRF on the WHOOP OAuth callback could link an attacker's WHOOP account to a victim's BNCO profile.
**Fix:** Add a `state` parameter with a cryptographically random value stored server-side (or in an encrypted cookie) for OAuth flows. Validate it on callback.

---

### HIGH-06: Missing Input Validation on Multiple Endpoints

**Files:**
- `src/connect-layer/src/routes/onboarding.routes.js` - `/complete` endpoint has no Joi schema validation
- `src/connect-layer/src/routes/studio.routes.js` - `/:id/goal` POST validates only `target_load_units`
- `src/connect-layer/src/routes/user.routes.js` - `PATCH /me` has no Joi validation, accepts arbitrary `name`, `avatar_url`, `role`
- `src/connect-layer/src/routes/membership.routes.js` - `/billing` POST only checks provider against allowlist but does not validate `api_key` format

**Risk:** Malformed or oversized payloads, unexpected field types, potential for injection or abuse.
**Fix:** Add Joi schemas to all POST/PATCH/PUT endpoints. Validate `name` length, `avatar_url` format (valid HTTPS URL), and all other user inputs.

---

### HIGH-07: JWT Secret Not Validated at Startup

**File:** `src/connect-layer/src/index.js`
**What:** The app does not check that `process.env.JWT_SECRET` is set before starting. If the env var is missing, `jwt.sign()` will use `undefined` as the secret, producing tokens that can be forged by anyone.
**Risk:** If deployed without `JWT_SECRET` set, all authentication is effectively bypassed.
**Fix:** Add startup validation:
```js
if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET is not set. Refusing to start.');
  process.exit(1);
}
```

---

### HIGH-08: WHOOP OAuth Callback Has No Auth Middleware

**File:** `src/connect-layer/src/routes/user.routes.js`, line ~145
**What:** The WHOOP callback endpoint `GET /me/devices/whoop/callback` has no `authMiddleware`. It trusts the `state` query parameter as the `userId`:
```js
const { code, state: userId } = req.query;
```
**Risk:** An attacker can craft a callback URL with any `userId` in the state parameter and link their WHOOP account to someone else's BNCO account.
**Fix:** Generate a cryptographic nonce stored server-side (or in Redis with TTL) before the OAuth redirect. On callback, look up the nonce to resolve the user ID. Never trust the raw `state` parameter as a user ID.

---

## 2. Auth Flow Integrity

### MEDIUM-01: Google OAuth Flow is Mostly Secure

**File:** `src/connect-layer/src/routes/auth.routes.js`, lines 65-105
**Assessment:** The Google token verification uses `google-auth-library` with `verifyIdToken` and validates the audience. This is correct. However:
- The `role` parameter in the Google auth request is accepted from the client, meaning a user could sign up directly as `studio_admin` without completing the studio setup flow.
**Fix:** Ignore the client-supplied `role` during Google auth. Default all new users to `athlete`. Role upgrade should only happen through the onboarding completion flow.

---

### MEDIUM-02: Token Refresh Race Condition (Frontend)

**File:** `app/api.js`, lines 100-145
**Assessment:** The frontend refresh logic has a queue (`refreshQueue`) for handling concurrent 401s, which is good. However, the backend refresh endpoint accepts the expired access token itself (not a separate refresh token), despite the frontend having separate `TOKEN_KEY` and `REFRESH_KEY`. The `attemptTokenRefresh()` function sends the refresh token to the backend, but the backend endpoint expects the old access token in the Authorization header. This is a mismatch.
**Risk:** Token refresh may silently fail in production, forcing unnecessary re-logins.
**Fix:** Align frontend and backend. Either:
1. Backend accepts refresh token in request body (preferred), or
2. Frontend sends the access token as it currently does, but the backend should not use `ignoreExpiration`.

---

### MEDIUM-03: Onboarding Completion Flow Fix Verification

**File:** `src/connect-layer/src/routes/onboarding.routes.js`, lines 10-100
**Assessment:** The onboarding endpoint uses `ON CONFLICT (user_id) DO UPDATE` which handles repeated submissions. The `pilates_frequency` field is set to `'studio_owner'` for studio admins, which is semantically wrong (it is a frequency field being used as a role marker). The schema columns (`pilates_frequency`) match what is being inserted, so there is no schema mismatch error. The fix appears functional.
**Issue:** Using `pilates_frequency = 'studio_owner'` is a data integrity smell. A boolean `is_studio_owner` or using the `users.role` column is cleaner.

---

## 3. Database

### MEDIUM-04: No Migration Management System

**Files:** `src/connect-layer/Dockerfile` (copies `migrations/`), no migration runner found
**What:** The Dockerfile copies a `migrations` directory, but there is no evidence of a migration runner (no `node-pg-migrate`, `knex migrate`, `prisma migrate`, or similar). The app uses raw SQL queries.
**Risk:** Schema changes are ad-hoc and hard to track. No rollback capability. Multiple developers can create conflicting schema states.
**Fix:** Adopt `node-pg-migrate` or `prisma`. Store all schema changes as versioned migrations. Run migrations on deploy.

---

### MEDIUM-05: Missing Database Indexes

**Files:** Based on query patterns across all route files
**What:** Multiple queries filter on columns that likely lack indexes:
- `users.email` (used in login, registration, Google auth lookup)
- `users.google_id` (used in Google auth)
- `studio_memberships.studio_id + user_id` (composite, used everywhere)
- `studio_memberships.status` (filtered in leaderboard, member lists)
- `workout_sessions.user_id + studio_id + recorded_at` (leaderboard, stats)
- `studios.slug` (slug lookups)
- `studios.join_code` (join-by-code)

**Risk:** Without indexes, queries degrade to full table scans as data grows.
**Fix:** Add indexes:
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE UNIQUE INDEX idx_studio_memberships_studio_user ON studio_memberships(studio_id, user_id);
CREATE INDEX idx_studio_memberships_status ON studio_memberships(studio_id, status);
CREATE INDEX idx_workout_sessions_user_studio_date ON workout_sessions(user_id, studio_id, recorded_at DESC);
CREATE UNIQUE INDEX idx_studios_slug ON studios(slug);
CREATE INDEX idx_studios_join_code ON studios(join_code) WHERE join_code IS NOT NULL;
```

---

### MEDIUM-06: No Connection Pool Tuning

**File:** `src/connect-layer/src/config/database.js`
**What:** The `Pool` is created with only `connectionString`. No `max`, `idleTimeoutMillis`, or `connectionTimeoutMillis` settings. Default `pg` pool max is 10 connections.
**Risk:** On Fly.io with 256MB RAM and a shared CPU, 10 connections may be too many or too few depending on load. No connection timeout means a stuck query can hold a connection forever.
**Fix:**
```js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});
```

---

### MEDIUM-07: N+1 Query Risk in Apple Health Sync

**File:** `src/connect-layer/src/routes/user.routes.js`, Apple Health sync endpoint
**What:** The Apple Health sync endpoint loops over each workout in the array and does an individual `INSERT` for each:
```js
for (const w of workouts) {
  // ...validation...
  await pool.query(`INSERT INTO workout_sessions ...`, [...]);
}
```
With up to 100 workouts per sync, that is 100 sequential database round trips.
**Risk:** Slow sync times, connection pool exhaustion under concurrent syncs.
**Fix:** Use a single batch `INSERT` with `unnest()` or build a multi-row `VALUES` clause.

---

### HIGH (reclassified from MEDIUM)-08: No SSL Configured for Database

**File:** `src/connect-layer/src/config/database.js`
**What:** No SSL configuration for the PostgreSQL connection. Fly.io Postgres typically requires or supports SSL.
**Risk:** Database credentials and data transmitted in plaintext between the app and database.
**Fix:** Add `ssl: { rejectUnauthorized: false }` for Fly.io (they use internal networking, but SSL is still best practice).

---

## 4. Frontend Architecture

### MEDIUM-08: Large Monolithic main.js (2004 Lines)

**File:** `app/main.js`
**What:** The main application file is 2004 lines. It handles routing, state management, UI rendering, demo data, leaderboard rendering, ghost racing, achievements, goals, studio challenges, and more.
**Risk:** Hard to maintain, test, or debug. High cognitive load for any developer.
**Fix:** Split into focused modules:
- `leaderboard.js` - leaderboard rendering and tab switching
- `ghost-racing.js` - ghost race logic
- `achievements.js` - badge grid rendering
- `studio-dashboard.js` - studio owner view
- `demo-data.js` - all demo/fallback data
- `router.js` - view switching logic

---

### MEDIUM-09: Event Listeners Not Cleaned Up

**Files:** `app/main.js`, `app/widgets.js`, `app/settings.js`
**What:** Event listeners are added (e.g., click handlers on leaderboard tabs, form submissions, IntersectionObserver, window resize) but never removed. The `initWidgetSystem` function in `widgets.js` sets up long-press listeners and drag handlers that persist even if the widget system is re-initialized.
**Risk:** Memory leaks on repeated navigation or re-initialization, especially on mobile devices with limited RAM.
**Fix:** Store listener references and call `removeEventListener` on cleanup. Use `AbortController` for groups of listeners.

---

### LOW-01: No Bundle Splitting or Lazy Loading

**File:** `app/index.html`
**What:** All JS is loaded as a single module entry (`/main.js`). Vite will bundle everything together. The BTL (Biometric Translation Layer) module is ~460 lines of math that is only needed when processing workout data.
**Risk:** Larger initial bundle than necessary. Users downloading BTL code on first visit even if they have not connected a wearable.
**Fix:** Use dynamic `import()` for BTL, widgets, and settings modules. Vite handles code splitting automatically with dynamic imports.

---

### LOW-02: Fake Stats on Landing Page

**File:** `app/index.html`, lines 90-105
**What:** The landing page shows counters for "12,847 Athletes", "342 Studios", "89 Cities" and testimonials from "Sarah K.", "Jessica M.", "Alex L." These are hardcoded fake numbers and fabricated testimonials.
**Risk:** Trust and legal risk if presented as real data. FTC guidelines require disclosure of fake testimonials.
**Fix:** Either source real data from the API, use language like "Join our growing community" without specific numbers, or clearly mark as illustrative. Replace fake testimonials with real ones or remove them.

---

## 5. API Design

### LOW-03: Inconsistent Error Response Format

**Files:** Various route files
**What:** Some endpoints return `{ error: 'message' }`, others return `{ message: 'message' }`. The global error handler in `index.js` returns `{ error: 'message' }`, but the API client expects both `data?.message` and `data?.error`.
**Risk:** Frontend error handling requires checking multiple fields, leading to inconsistent user-facing error messages.
**Fix:** Standardize on `{ error: { code: 'ERROR_CODE', message: 'Human readable' } }` for all error responses.

---

### LOW-04: GET Used for WHOOP OAuth Initiation

**File:** `src/connect-layer/src/routes/user.routes.js`
**What:** The WHOOP connect endpoint is `POST /me/devices/whoop`, but the frontend `api.js` calls it with `GET` (line: `connectWhoop` function uses default GET). Meanwhile, the backend also has a `POST` handler. This mismatch may cause 405 errors.
**Risk:** Non-functional WHOOP connection flow.
**Fix:** Align frontend and backend on the HTTP method. POST is appropriate for initiating OAuth.

---

### MEDIUM-10: No Pagination on List Endpoints

**Files:** `src/connect-layer/src/routes/studio.routes.js` (members, at-risk), `src/connect-layer/src/routes/membership.routes.js` (members, requests)
**What:** Member list endpoints return all results with no pagination. The leaderboard has `LIMIT 50`, but member lists and at-risk queries have no limit.
**Risk:** As studios grow, these queries return increasingly large payloads, slowing down the API and consuming memory.
**Fix:** Add `limit` and `offset` query parameters with sensible defaults (e.g., limit=50, max=100).

---

### LOW-05: Missing Endpoints

**Assessment:** Several features visible in the frontend have no corresponding API endpoints:
- Personal goals (set/get/update) - frontend form exists but no API integration
- Challenge creation (studio vs studio) - UI button exists, no endpoint
- Ghost racing data - entirely demo/hardcoded
- City/state/global leaderboards - only studio leaderboard has a real endpoint
**Risk:** Features appear broken or misleading when users interact with them expecting real functionality.
**Fix:** Either implement the endpoints or clearly mark features as "Coming Soon" in the UI.

---

## 6. Performance

### MEDIUM-09 (duplicate, renumber): Complex Leaderboard Queries

**File:** `src/connect-layer/src/routes/studio.routes.js`, leaderboard endpoint
**What:** The leaderboard query joins `studio_memberships`, `users`, and `workout_sessions` with aggregate functions (AVG, COUNT) and date filtering. The at-risk query is even more complex, with multiple correlated subqueries per row.
**Risk:** These queries will become slow as workout data grows. The at-risk query runs 3 subqueries per member.
**Fix:** Pre-compute leaderboard scores in a materialized view or cache layer. Use Redis for leaderboard caching with a short TTL (5-10 minutes).

---

### LOW-06: No Caching Strategy

**Files:** Backend routes, Redis config
**What:** Redis is imported and passed to routes but is not used for caching anywhere in the reviewed routes. Every request hits PostgreSQL directly.
**Risk:** Unnecessary database load for frequently-accessed, rarely-changing data (leaderboards, studio info, user profiles).
**Fix:** Implement Redis caching for:
- Leaderboards: cache for 5 minutes
- Studio details: cache for 1 hour
- User profiles: cache for 5 minutes, invalidate on update

---

### MEDIUM (Overall): Fly.io Resource Constraints

**File:** `src/connect-layer/fly.toml`
**What:** The VM runs on `shared-cpu-1x` with 256MB RAM. `min_machines_running = 0` means cold starts when no traffic.
**Risk:** Cold starts add 2-5 seconds latency for the first request after idle. 256MB is tight for Node.js under load.
**Fix:** Set `min_machines_running = 1` for consistent availability (costs ~$2/month). Consider 512MB if you see OOM issues.

---

## 7. Infrastructure

### Dockerfile Assessment

**File:** `src/connect-layer/Dockerfile`
**Strengths:**
- Multi-stage build (good)
- Non-root user (good)
- Health check configured (good)
- Alpine base (minimal attack surface)

**No issues found** in the Dockerfile. Well-structured.

---

## Summary Table

| ID | Severity | Category | File | Summary |
|---|---|---|---|---|
| CRITICAL-01 | CRITICAL | Security | auth.js:264 | Hardcoded Google Client ID fallback |
| CRITICAL-02 | CRITICAL | Security | onboarding.js:9 | Hardcoded Google Places API key (billable) |
| CRITICAL-03 | CRITICAL | Security | auth.routes.js:140 | Refresh endpoint accepts any expired token forever |
| CRITICAL-04 | CRITICAL | Security | membership.routes.js:100 | Billing API keys stored unencrypted |
| HIGH-01 | HIGH | Security | index.js | No rate limiting on auth endpoints |
| HIGH-02 | HIGH | Security | user.routes.js | WHOOP tokens stored in plaintext |
| HIGH-03 | HIGH | Security | main.js, settings.js | XSS via innerHTML with user data |
| HIGH-04 | HIGH | Config | index.js:24 | CORS single-origin limitation |
| HIGH-05 | HIGH | Security | All routes | No CSRF on OAuth callbacks |
| HIGH-06 | HIGH | Security | Multiple routes | Missing input validation on several endpoints |
| HIGH-07 | HIGH | Security | index.js | JWT_SECRET not validated at startup |
| HIGH-08 | HIGH | Security | user.routes.js:145 | WHOOP callback trusts userId from query param |
| MEDIUM-01 | MEDIUM | Auth | auth.routes.js:70 | Client can self-assign studio_admin role |
| MEDIUM-02 | MEDIUM | Auth | api.js | Token refresh frontend/backend mismatch |
| MEDIUM-03 | MEDIUM | Auth | onboarding.routes.js | pilates_frequency used as role marker |
| MEDIUM-04 | MEDIUM | Database | Project-wide | No migration management system |
| MEDIUM-05 | MEDIUM | Database | Query patterns | Missing indexes on frequently queried columns |
| MEDIUM-06 | MEDIUM | Database | database.js | No connection pool tuning or SSL |
| MEDIUM-07 | MEDIUM | Database | user.routes.js | N+1 inserts in Apple Health sync |
| MEDIUM-08 | MEDIUM | Frontend | main.js | 2004-line monolith, hard to maintain |
| MEDIUM-09 | MEDIUM | Frontend | Multiple | Event listeners never cleaned up |
| MEDIUM-10 | MEDIUM | API | Multiple | No pagination on list endpoints |
| LOW-01 | LOW | Frontend | index.html | No code splitting or lazy loading |
| LOW-02 | LOW | Frontend | index.html | Fake statistics and fabricated testimonials |
| LOW-03 | LOW | API | Multiple | Inconsistent error response format |
| LOW-04 | LOW | API | user.routes.js / api.js | GET vs POST mismatch on WHOOP connect |
| LOW-05 | LOW | API | Multiple | Missing endpoints for visible UI features |
| LOW-06 | LOW | Performance | Backend | Redis imported but never used for caching |

---

## Recommended Priority Order

**Immediate (this week):**
1. Restrict the Google Places API key in GCP console (referrer restriction) - CRITICAL-02
2. Implement rate limiting on auth endpoints - HIGH-01
3. Fix WHOOP OAuth callback to not trust user ID from query param - HIGH-08
4. Validate JWT_SECRET exists at startup - HIGH-07
5. Remove hardcoded API key fallbacks from frontend - CRITICAL-01, CRITICAL-02

**Next sprint:**
6. Implement proper refresh token rotation - CRITICAL-03
7. Encrypt stored tokens and API keys - CRITICAL-04, HIGH-02
8. Add Joi validation to all endpoints - HIGH-06
9. Sanitize innerHTML usage - HIGH-03
10. Add database indexes - MEDIUM-05

**Backlog:**
11. Adopt migration system
12. Implement Redis caching
13. Break up main.js monolith
14. Add pagination to list endpoints
15. Implement missing API endpoints or mark features as coming soon

---

*Report generated 2026-03-04 21:17 EST by Ethan (CTO)*
