# BNCO API - Fly.io Deployment Log

**Deployed:** 2026-03-04 08:36 EST
**Deployed by:** Circuit (infrastructure lead)

## Application

- **App name:** bnco-api
- **URL:** https://bnco-api.fly.dev
- **Region:** iad (Ashburn, Virginia)
- **VM:** shared-cpu-1x, 256MB RAM
- **Image:** Node 20 Alpine (multi-stage build, ~44MB)

## PostgreSQL

- **App name:** bnco-db
- **Hostname:** bnco-db.internal / bnco-db.flycast
- **Flycast IP:** fdaa:4b:b193:0:1::2
- **Port:** 5432
- **Database:** bnco_api
- **Admin user:** postgres
- **App user:** bnco_api (auto-created by `flyctl postgres attach`)
- **DATABASE_URL:** Auto-set as secret on bnco-api via postgres attach
  - `postgres://bnco_api:<token>@bnco-db.flycast:5432/bnco_api?sslmode=disable`

### Migrations Applied

1. `001_initial.sql` - Core tables (users, studios, memberships, workouts, challenges, etc.)
2. `002_onboarding.sql` - Onboarding tables, profile additions
3. `003_fix_password_nullable.sql` - Password column nullable fix
4. Granted all privileges to bnco_api user on all tables/sequences

## Redis (Upstash)

- **Name:** bnco-redis
- **Provider:** Upstash (via Fly.io)
- **URL:** `redis://default:<token>@fly-bnco-redis.upstash.io:6379`
- **Pricing:** $0.20 per 100K commands (pay-as-you-go)
- **REDIS_URL:** Set as secret on bnco-api

## Secrets Set

| Secret | Source |
|--------|--------|
| DATABASE_URL | Auto-set by `flyctl postgres attach` |
| REDIS_URL | Set manually from Upstash provisioning |
| JWT_SECRET | Generated via `openssl rand -hex 32` |
| NODE_ENV | `production` |
| PORT | `3001` |

## Health Check

```
GET https://bnco-api.fly.dev/health
{"status":"ok","service":"bnco-connect-layer","timestamp":"2026-03-04T13:36:21.801Z"}
```

## Dockerfile Fix

The original Dockerfile had a file permissions issue - config files were copied with `600` (owner-only) permissions, but the app runs as the non-root `bnco` user. Fixed by adding `--chown=bnco:bnco` to COPY commands and a `chmod -R a+r` step.

## Networking

- **IPv6 (dedicated):** 2a09:8280:1::dc:70d8:0
- **IPv4 (shared):** 66.241.125.45
- For a dedicated IPv4: `fly ips allocate-v4 --app bnco-api`

## Notes

- Auto-stop/auto-start is enabled (machines scale to zero when idle)
- Min machines: 0 (cost-efficient, cold starts ~2s)
- Health check: GET /health every 30s, 10s grace period
