# Changelog: Backend Fixes (connect-layer)

**Date:** 2026-03-04
**Author:** Ethan (CTO)

---

## Bug Fixes

### 1. studio.routes.js - Typo in table name
- **Fixed:** `studio_membershipships` -> `studio_memberships` in the CREATE studio route (auto-join owner INSERT).

### 2. Migration consistency audit
- Audited all route files (`auth`, `user`, `workout`, `studio`, `membership`, `onboarding`, `challenge`, `lobby`, `webhook`) for references to the old `studio_members` table name.
- **Result:** All route files were already using `studio_memberships`. No additional changes needed beyond the typo fix in #1.

### 3. Migration 003: Fix password_hash nullable
- **Created:** `migrations/003_fix_password_nullable.sql`
- Runs `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;` so Google OAuth users can register without a password.
- Drops the unused `password_hash_nullable` column that was added in migration 002 but never referenced.

### 4. auth.routes.js - Google token verification
- **Replaced** stub `verifyGoogleToken` function with proper implementation using `google-auth-library` (`OAuth2Client.verifyIdToken`).
- Added `google-auth-library` (^9.14.0) to `package.json` dependencies.
- Added `GOOGLE_CLIENT_ID` to `.env.example`.

### 5. user.routes.js - Remove dynamic import of node-fetch
- **Removed** `const fetch = (await import('node-fetch')).default;` dynamic import.
- Now uses Node 18+ native global `fetch`.
- Added comment at top of file noting Node 18+ requirement.

### 6. lobby.routes.js - SSE Redis subscriber fix
- **Fixed:** `redis.duplicate()` in ioredis doesn't auto-connect for subscriptions.
- Added explicit `await subscriber.connect()` before subscribing.
- Added error handling: if connection/subscribe fails, sends an SSE error event and closes the stream cleanly.
- Added `subscriber.on('error')` handler with logging.
- Wrapped `unsubscribe()` and `disconnect()` in `.catch(() => {})` to prevent unhandled rejections on close.

## New Files

### 7. Config files (from ARCHITECTURE.md)
- **Created:** `src/config/database.js` - Exports configured `pg.Pool` instance.
- **Created:** `src/config/redis.js` - Exports configured `ioredis` instance.
- **Created:** `src/config/whoop.js` - Exports WHOOP API configuration object.
- **Refactored:** `src/index.js` - Imports `pool` and `redis` from config modules instead of creating them inline.

### 8. Middleware
- **Created:** `src/middleware/rateLimit.js` - Three rate limiters: `apiLimiter` (100/15min), `authLimiter` (20/15min), `webhookLimiter` (500/15min). Uses `express-rate-limit`.
- **Created:** `src/middleware/validate.js` - Joi-based validation middleware factory. Usage: `validate(schema)` returns Express middleware. Supports `body`, `query`, `params`.
- Added `express-rate-limit` (^7.4.0) to `package.json` dependencies.

### 9. scoring.service.js - Null stillness handling
- **Improved:** `calculateBncoScore` now has explicit JSDoc documenting the weight redistribution behavior for null sub-scores.
- The function already handled null scores by redistributing weights proportionally (the code was correct, just undocumented). Added documentation and `clamp()` call on the final result.
- Example: When `stillness=null` (WHOOP-only), control gets ~61.5% weight and respiratory gets ~38.5%.

### 10. Seed file
- **Created:** `src/config/seed.js` - Runnable via `npm run seed`.
- Creates: 2 users (owner + athlete), 1 studio with memberships, 6 workout sessions across last 7 days, 1 weekly goal (500 target load units).
- Uses transactions for safe rollback on failure.
- Handles `ON CONFLICT` for re-runnability.

## Dependency Changes

| Package | Version | Type |
|---------|---------|------|
| google-auth-library | ^9.14.0 | Added |
| express-rate-limit | ^7.4.0 | Added |

## Verification

- `npm install` completed successfully (0 vulnerabilities).
- All 18 JS files pass `node -c` syntax check.
- No references to old `studio_members` table found in any route file.
