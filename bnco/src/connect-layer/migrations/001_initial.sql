-- bnco Database Schema
-- Run: psql $DATABASE_URL < migrations/001_initial.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
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

-- Studios
CREATE TABLE IF NOT EXISTS studios (
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

-- Studio Members
CREATE TABLE IF NOT EXISTS studio_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES studios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  show_on_leaderboard BOOLEAN DEFAULT true,
  UNIQUE(studio_id, user_id)
);

-- Workout Sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
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

CREATE INDEX IF NOT EXISTS idx_workouts_user ON workout_sessions(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_studio ON workout_sessions(studio_id, recorded_at DESC);

-- Weekly Goals
CREATE TABLE IF NOT EXISTS weekly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES studios(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  target_load_units INTEGER NOT NULL,
  current_load_units INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(studio_id, week_start)
);

-- Studio Challenges
CREATE TABLE IF NOT EXISTS studio_challenges (
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

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
