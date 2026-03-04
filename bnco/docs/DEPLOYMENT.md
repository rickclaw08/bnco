# bnco Deployment Guide

## Architecture

```
Users --> Netlify (Frontend) --> Railway (API) --> PostgreSQL + Redis
                                     |
                              WHOOP Cloud (Webhooks)
```

- **Frontend**: Vite SPA deployed to Netlify
- **Backend**: Node.js/Express API deployed to Railway
- **Database**: PostgreSQL 16 (Railway managed)
- **Cache/PubSub**: Redis 7 (Railway managed)
- **Alternative API host**: Fly.io

---

## Local Development

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- npm

### Quick Start (Docker)

```bash
# Clone and start everything
cd bnco
make dev

# This runs:
# - API on http://localhost:3001
# - PostgreSQL on localhost:5432
# - Redis on localhost:6379
# - Migrations auto-applied via init scripts
```

PostgreSQL is seeded with migrations from `src/connect-layer/migrations/` automatically on first run (files mounted into `/docker-entrypoint-initdb.d`).

### Quick Start (Manual)

```bash
# Start PostgreSQL and Redis locally (or use Docker for just those)
docker-compose up -d postgres redis

# Install backend deps
cd src/connect-layer
cp .env.example .env
# Edit .env with your local values
npm install

# Run migrations
npm run migrate

# Start dev server (with hot reload)
npm run dev

# In another terminal, start frontend
cd app
npm install
npm run dev
```

### Useful Commands

```bash
make dev       # Start all services (docker-compose dev mode)
make test      # Run backend tests
make migrate   # Run database migrations
make seed      # Seed test data
make build     # Build frontend
make logs      # Tail API logs
make clean     # Stop all, remove volumes
```

---

## Production Deployment

### Backend: Railway

Railway is the primary PaaS for the API service.

#### Initial Setup

1. Create a Railway project at [railway.app](https://railway.app)
2. Add services:
   - **PostgreSQL**: Add via Railway's database plugin
   - **Redis**: Add via Railway's Redis plugin
   - **API**: Connect your GitHub repo
3. Railway auto-detects `railway.toml` for build/deploy config
4. Set environment variables (see [Environment Variables](#environment-variables) below)

#### Deploy

Pushes to `main` trigger automatic deploys via GitHub Actions:

```bash
# Manual deploy (if needed)
npm install -g @railway/cli
railway login
railway up
```

#### Railway Environment Variables

Railway auto-injects `DATABASE_URL` and `REDIS_URL` when you link the PostgreSQL and Redis plugins. You still need to set:

- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `WHOOP_CLIENT_ID`
- `WHOOP_CLIENT_SECRET`
- `WHOOP_REDIRECT_URI`
- `WHOOP_WEBHOOK_SECRET`
- `FRONTEND_URL`

### Frontend: Netlify

The Vite frontend is deployed to Netlify.

- **Site ID**: `7b9aae37-a1af-4244-8cd3-e2522c38536e`
- **Config**: `app/netlify.toml`

#### Netlify Settings

- Build command: `npx vite build`
- Publish directory: `dist`
- Node version: 20

#### Netlify Environment Variables

Set in Netlify UI (Site settings > Environment variables):

- `VITE_API_URL`: `https://api.bnco.app` (or your Railway API URL)

### Alternative: Fly.io

A `fly.toml` is provided at `src/connect-layer/fly.toml` as an alternative deployment target.

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
cd src/connect-layer
fly deploy

# Set secrets
fly secrets set JWT_SECRET=your-secret
fly secrets set DATABASE_URL=your-postgres-url
fly secrets set REDIS_URL=your-redis-url
# ... etc
```

---

## Environment Variables

### Backend (`src/connect-layer/.env.example`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | Yes | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for signing JWTs | Yes | - |
| `JWT_EXPIRES_IN` | JWT token expiration | No | `7d` |
| `WHOOP_CLIENT_ID` | WHOOP Developer API client ID | Yes | - |
| `WHOOP_CLIENT_SECRET` | WHOOP Developer API client secret | Yes | - |
| `WHOOP_REDIRECT_URI` | OAuth callback URL for WHOOP | Yes | - |
| `WHOOP_WEBHOOK_SECRET` | WHOOP webhook verification secret | Yes | - |
| `PORT` | API server port | No | `3001` |
| `NODE_ENV` | Environment (`development`/`production`/`test`) | No | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | No | `http://localhost:3000` |

### Frontend (set in Netlify or `.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | Yes | - |

### Docker Compose Overrides

These control exposed ports when running via Docker Compose:

| Variable | Description | Default |
|----------|-------------|---------|
| `API_PORT` | Host port for API | `3001` |
| `PG_PORT` | Host port for PostgreSQL | `5432` |
| `REDIS_PORT` | Host port for Redis | `6379` |

---

## Database Migrations

Migrations live in `src/connect-layer/migrations/` and are numbered sequentially.

### Running Migrations

```bash
# Via make
make migrate

# Via npm (from connect-layer dir)
cd src/connect-layer
npm run migrate

# Via Docker Compose (auto-runs on first postgres start)
# Migrations in migrations/ are mounted to /docker-entrypoint-initdb.d

# Manual (psql)
psql $DATABASE_URL -f migrations/001_initial.sql
psql $DATABASE_URL -f migrations/002_onboarding.sql
psql $DATABASE_URL -f migrations/003_fix_password_nullable.sql
```

### Creating New Migrations

```bash
# Naming convention: NNN_description.sql
touch src/connect-layer/migrations/004_your_change.sql
```

Keep migrations idempotent where possible (use `IF NOT EXISTS`, `IF EXISTS`).

### Seeding Test Data

```bash
make seed
# or
cd src/connect-layer && npm run seed
```

---

## CI/CD Pipeline

GitHub Actions workflow at `.github/workflows/deploy.yml`:

```
push to main
  |
  +-- [test-backend] Lint + test (with PG + Redis services)
  |         |
  |         +-- [deploy-backend] Railway deploy (on success)
  |
  +-- [build-frontend] Build Vite app
              |
              +-- [deploy-frontend] Netlify deploy (on success)
```

### Required GitHub Secrets

| Secret | Where to get it |
|--------|----------------|
| `RAILWAY_TOKEN` | Railway Dashboard > Account > Tokens |
| `NETLIFY_AUTH_TOKEN` | Netlify > User Settings > Applications > Personal access tokens |

### Required GitHub Variables (optional)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Override API URL for frontend build |

---

## Monitoring & Logs

### Railway

```bash
# View logs
railway logs

# Or use Railway dashboard: https://railway.app/dashboard
```

### Netlify

- Deploy logs: Netlify Dashboard > Deploys
- Function logs: Netlify Dashboard > Functions (if using edge functions)

### Fly.io (if using)

```bash
fly logs --app bnco-api
fly status --app bnco-api
```

### Health Check

The API exposes a health endpoint:

```bash
curl https://api.bnco.app/health
# {"status":"ok","service":"bnco-connect-layer","timestamp":"..."}
```

### Docker Compose Logs

```bash
# All services
make logs

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres
```

---

## Troubleshooting

### API won't start

1. Check `DATABASE_URL` is correct and PostgreSQL is running
2. Check `REDIS_URL` is correct and Redis is running
3. Verify migrations have been applied
4. Check logs: `docker-compose logs api` or `railway logs`

### Database connection refused

```bash
# Test PostgreSQL connectivity
psql $DATABASE_URL -c "SELECT 1"

# Check if service is running
docker-compose ps postgres
```

### Frontend shows blank page

1. Check browser console for errors
2. Verify `VITE_API_URL` is set correctly
3. Check Netlify deploy logs for build errors
4. Ensure SPA redirects are working (`netlify.toml` config)
