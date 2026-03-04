# bnco Technical Architecture

## System Overview

```
                    +------------------+
                    |  WHOOP Cloud     |
                    |  (Developer API) |
                    +--------+---------+
                             |
                    Webhook / OAuth
                             |
+----------------+  +--------v---------+  +------------------+
| Consumer App   |  |                  |  | Studio Dashboard |
| (React Native) +-->  bnco API        <--+ (Next.js)        |
| iOS            |  |  (Node/Express)  |  |                  |
+-------+--------+  +--------+---------+  +------------------+
        |                     |
  HealthKit +                 |
  CoreMotion           +------v------+
        |              | PostgreSQL  |
+-------v--------+    +------+------+
| Apple Watch    |           |
| (on-device)    |    +------v------+     +------------------+
+----------------+    |   Redis     +----->  Lobby Feed       |
                      | (pub/sub)   |     |  (Next.js SSE)   |
                      +-------------+     +------------------+
```

## Connect Layer (API Server)

### Directory Structure
```
connect-layer/
  src/
    index.js              - Express app entry
    config/
      database.js         - PostgreSQL connection
      redis.js            - Redis connection
      whoop.js            - WHOOP API config
    middleware/
      auth.js             - JWT verification
      rateLimit.js        - Rate limiting
      validate.js         - Input validation (Joi)
    routes/
      auth.routes.js      - Register, login, refresh
      user.routes.js      - Profile, device connections
      workout.routes.js   - Submit/query workouts
      studio.routes.js    - Studio CRUD, members, goals
      challenge.routes.js - Studio challenges
      lobby.routes.js     - Lobby feed data
      webhook.routes.js   - WHOOP webhooks
    services/
      scoring.service.js  - bnco Score engine
      whoop.service.js    - WHOOP API client
      studio.service.js   - Studio business logic
      challenge.service.js
    models/
      user.model.js
      studio.model.js
      workout.model.js
      challenge.model.js
      weeklyGoal.model.js
    utils/
      errors.js
      logger.js
  migrations/             - Database migrations
  seeds/                  - Test data
  tests/
  package.json
  Dockerfile
  .env.example
```

## Database Schema

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'athlete' CHECK (role IN ('athlete', 'studio_admin', 'studio_staff')),
  whoop_token TEXT,
  whoop_refresh_token TEXT,
  whoop_user_id VARCHAR(100),
  apple_health_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### studios
```sql
CREATE TABLE studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  owner_id UUID REFERENCES users(id) NOT NULL,
  logo_url TEXT,
  accent_color VARCHAR(7) DEFAULT '#4ade80',
  lobby_pin VARCHAR(6),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### studio_members
```sql
CREATE TABLE studio_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES studios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  show_on_leaderboard BOOLEAN DEFAULT true,
  UNIQUE(studio_id, user_id)
);
```

### workout_sessions
```sql
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  studio_id UUID REFERENCES studios(id),
  recorded_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  source VARCHAR(20) CHECK (source IN ('whoop', 'apple_watch', 'both')),
  raw_muscular_load DECIMAL,
  raw_stability_variance DECIMAL,
  raw_respiratory_rate DECIMAL,
  raw_hrv DECIMAL,
  control_score INTEGER CHECK (control_score BETWEEN 0 AND 100),
  stillness_score INTEGER CHECK (stillness_score BETWEEN 0 AND 100),
  respiratory_score INTEGER CHECK (respiratory_score BETWEEN 0 AND 100),
  bnco_score INTEGER CHECK (bnco_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workouts_user ON workout_sessions(user_id, recorded_at DESC);
CREATE INDEX idx_workouts_studio ON workout_sessions(studio_id, recorded_at DESC);
```

### weekly_goals
```sql
CREATE TABLE weekly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES studios(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  target_load_units INTEGER NOT NULL,
  current_load_units INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(studio_id, week_start)
);
```

### studio_challenges
```sql
CREATE TABLE studio_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_studio_id UUID REFERENCES studios(id),
  defender_studio_id UUID REFERENCES studios(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  metric VARCHAR(30) DEFAULT 'avg_stability',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'declined')),
  challenger_avg DECIMAL,
  defender_avg DECIMAL,
  winner_studio_id UUID REFERENCES studios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### achievements
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
```

## Scoring Engine

```javascript
// scoring.service.js - bnco Score Engine

const WEIGHTS = {
  control: 0.40,
  stillness: 0.35,
  respiratory: 0.25,
};

function calculateControlScore(muscularLoad, duration) {
  // Ratio of controlled load to total movement
  // WHOOP muscular_strain normalized by duration
  // Higher = more controlled eccentric movement
  const normalized = muscularLoad / (duration * 10); // baseline normalization
  return Math.min(100, Math.round(normalized * 100));
}

function calculateStillnessScore(stabilityVariance) {
  // Lower variance = higher stability = higher score
  // Typical range: 0.01 (very stable) to 1.0 (very wobbly)
  const inverted = 1 - Math.min(1, stabilityVariance);
  return Math.round(inverted * 100);
}

function calculateRespiratoryScore(respiratoryRate, avgHeartRate) {
  // Ideal Pilates breathing: 8-14 breaths/min during moderate effort
  // Penalize breath-holding (very low) or hyperventilation (very high)
  const ideal = 11; // center of optimal range
  const deviation = Math.abs(respiratoryRate - ideal);
  const score = Math.max(0, 100 - (deviation * 10));
  return Math.round(score);
}

function calculateBncoScore(control, stillness, respiratory) {
  return Math.round(
    control * WEIGHTS.control +
    stillness * WEIGHTS.stillness +
    respiratory * WEIGHTS.respiratory
  );
}

module.exports = {
  calculateControlScore,
  calculateStillnessScore,
  calculateRespiratoryScore,
  calculateBncoScore,
  WEIGHTS,
};
```

## WHOOP Webhook Handler

```javascript
// webhook.routes.js

router.post('/whoop', async (req, res) => {
  const { user_id, activity_type, muscular_strain, hrv_impact, respiratory_rate, duration } = req.body;

  // Only process Pilates activities
  if (activity_type !== 'pilates') {
    return res.status(200).json({ ignored: true });
  }

  // Find bnco user by whoop_user_id
  const user = await User.findOne({ whoop_user_id: user_id });
  if (!user) return res.status(200).json({ ignored: true });

  // Calculate scores
  const control = calculateControlScore(muscular_strain, duration);
  const respiratory = calculateRespiratoryScore(respiratory_rate);

  // Store workout (stillness comes from Apple Watch, may be null)
  const workout = await WorkoutSession.create({
    user_id: user.id,
    source: 'whoop',
    raw_muscular_load: muscular_strain,
    raw_respiratory_rate: respiratory_rate,
    raw_hrv: hrv_impact,
    duration_minutes: duration,
    control_score: control,
    respiratory_score: respiratory,
    // bnco_score calculated when both sources merge, or partial if single-device
  });

  // Update studio weekly goal if user belongs to one
  await updateStudioGoal(user.id, muscular_strain);

  // Publish real-time update for lobby feed
  await redis.publish(`studio:${workout.studio_id}:update`, JSON.stringify(workout));

  res.status(200).json({ processed: true });
});
```

## Environment Variables

```
# .env.example

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/bnco

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d

# WHOOP
WHOOP_CLIENT_ID=your-whoop-client-id
WHOOP_CLIENT_SECRET=your-whoop-client-secret
WHOOP_REDIRECT_URI=https://api.bnco.app/api/users/me/devices/whoop/callback
WHOOP_WEBHOOK_SECRET=your-webhook-secret

# App
PORT=3001
NODE_ENV=development
FRONTEND_URL=https://bnco.app
```
