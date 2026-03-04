# bnco - High-Performance Social Layer for Pilates

A gamified B2B2C platform where studios compete and athletes hit Precision Peaks. bnco turns wearable data from WHOOP and Apple Watch into Pilates-specific scores, powering studio leaderboards, weekly community goals, and studio-to-studio challenges.

---

## What bnco Does

- **Athletes** get a Precision Score (0-100) after every Pilates session based on control, stability, and breathing
- **Studios** get a dashboard with leaderboards, member management, and engagement tools
- **Lobby TVs** show real-time community progress, athlete spotlights, and challenge scoreboards

Unlike generic fitness apps that track calories and steps, bnco measures what actually matters in Pilates: muscular control, core stability, and breath integration.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + vanilla JS (deployed on Netlify) |
| Backend API | Node.js + Express (Connect Layer) |
| Database | PostgreSQL |
| Cache / Real-time | Redis (pub/sub for lobby SSE) |
| Auth | JWT + bcrypt + Google OAuth |
| Wearables | WHOOP API (OAuth + Webhooks), Apple HealthKit + CoreMotion |
| Mobile (planned) | React Native (Expo) |
| Studio Dashboard (planned) | Next.js 14 |
| Infra | Netlify (frontend), Railway/Fly.io (backend, planned) |

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Backend (Connect Layer)

```bash
cd src/connect-layer
cp .env.example .env
# Edit .env with your database URL, Redis URL, JWT secret, etc.

npm install
npm run migrate   # Run database migrations
npm start         # Starts on port 3001
```

Verify it's running:

```bash
curl http://localhost:3001/health
# {"status":"ok","service":"bnco-connect-layer","timestamp":"..."}
```

### Frontend

```bash
cd app
npm install
npm run dev       # Starts Vite dev server on port 3000
```

### Database Setup

Run migrations in order:

```bash
psql $DATABASE_URL < src/connect-layer/migrations/001_initial.sql
psql $DATABASE_URL < src/connect-layer/migrations/002_onboarding.sql
psql $DATABASE_URL < src/connect-layer/migrations/003_fix_password_nullable.sql
```

---

## Project Structure

```
bnco/
  README.md                     # This file
  SKILL.md                      # Full CompeteHealth specification
  
  app/                          # Vite frontend (deployed on Netlify)
    index.html                  # Main app (athlete + studio views)
    main.js                     # App logic (leaderboards, achievements, missions)
    btl.js                      # Biometric Translation Layer (Power/Flow/Grit/Zen)
    style.css                   # Dark Pilates aesthetic
  
  src/
    connect-layer/              # Node.js/Express backend API
      src/
        index.js                # Express entry point
        middleware/
          auth.js               # JWT auth + role-based access
        routes/
          auth.routes.js        # Register, login, Google OAuth, refresh
          user.routes.js        # Profile, WHOOP OAuth, Apple Watch
          onboarding.routes.js  # Athlete onboarding, studio search
          workout.routes.js     # Submit workouts, history, stats
          studio.routes.js      # Studio CRUD, leaderboard, goals, members
          membership.routes.js  # Approval queue, billing integration
          challenge.routes.js   # Studio-to-studio challenges
          lobby.routes.js       # Lobby feed data + SSE stream
          webhook.routes.js     # WHOOP webhook handler
        services/
          scoring.service.js    # bnco Score + BTL Vibe Score + RES engine
      migrations/               # PostgreSQL schema migrations
      package.json
      Dockerfile
      .env.example
    consumer-app/               # React Native iOS app (planned)
    studio-dashboard/           # Next.js studio dashboard (planned)
    lobby-feed/                 # Next.js lobby TV display (planned)
  
  docs/
    PRD.md                      # Product requirements document
    ARCHITECTURE.md             # System architecture + database schema
    ONBOARDING.md               # Auth & verification flows
    PROJECT_STATUS.md           # Current status + feature checklist
    API_REFERENCE.md            # Full API documentation with curl examples
    WEARABLE_INTEGRATION.md     # WHOOP, Apple HealthKit, Terra API guide
    STUDIO_PLAYBOOK.md          # Studio adoption guide
    ROADMAP.md                  # Multi-phase product roadmap
  
  references/
    scoring_math.md             # RES algorithm, XP scaling, streak math
    biometrics_mapping.md       # BTL field mapping (WHOOP + Apple -> scores)
    geo_logic.md                # Geo-tiered leaderboard logic
    studio_api.md               # Studio dashboard API (missions, analytics)
```

---

## Three Scoring Systems

| System | Purpose | Components |
|--------|---------|------------|
| **bnco Score** (0-100) | Pilates-specific precision measurement | Control (40%) + Stillness (35%) + Respiratory (25%) |
| **BTL Vibe Score** (0-100) | General athletic performance | Power (30%) + Flow (25%) + Grit (25%) + Zen (20%) |
| **RES** (0-100) | Fair competition across fitness levels | Baseline-relative, age-normalized effort |

All three systems handle missing data gracefully by redistributing weights among available metrics.

---

## Auth & Onboarding

**Athletes:** Google/Email signup -> Onboarding ("Which studio? How often? What devices?") -> Pending studio membership -> Approved manually or auto via billing

**Studios:** Google/Email signup -> Studio registration (name, slug, city) -> Demo dashboard -> Connect billing (Stripe/MindBody/Mariana Tek) for auto-member approval

---

## Documentation

| Document | Description |
|----------|-------------|
| [PRD](docs/PRD.md) | Full product requirements, data models, features |
| [Architecture](docs/ARCHITECTURE.md) | System design, database schema, scoring engine code |
| [API Reference](docs/API_REFERENCE.md) | Every endpoint with request/response formats and curl examples |
| [Wearable Integration](docs/WEARABLE_INTEGRATION.md) | WHOOP, Apple HealthKit, Terra API setup |
| [Studio Playbook](docs/STUDIO_PLAYBOOK.md) | How studios adopt bnco, engagement best practices |
| [Onboarding](docs/ONBOARDING.md) | Auth flows and membership verification |
| [Project Status](docs/PROJECT_STATUS.md) | Current feature checklist, blockers, next steps |
| [Roadmap](docs/ROADMAP.md) | Multi-phase product plan |

---

## Netlify Deployment

- **Site ID:** `7b9aae37-a1af-4244-8cd3-e2522c38536e`
- **Build command:** `cd app && npm run build`
- **Publish directory:** `app/dist`

---

## Contributing

1. Clone the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and test locally
4. Commit with descriptive messages
5. Open a PR against `main`

### Code Style

- Use `const`/`let` (no `var`)
- Async/await for all async operations
- Joi validation on all route inputs
- Proper error handling with `next(err)` in Express routes
- Consistent naming: camelCase for JS, snake_case for DB columns

### Testing

```bash
cd src/connect-layer
npm test                    # Run test suite (tests TBD)
```

---

## Environment Variables

See `src/connect-layer/.env.example` for the full list. Required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing auth tokens
- `WHOOP_CLIENT_ID` / `WHOOP_CLIENT_SECRET` - WHOOP Developer API credentials
- `GOOGLE_CLIENT_ID` - Google OAuth client ID

---

## License

Proprietary. All rights reserved.
