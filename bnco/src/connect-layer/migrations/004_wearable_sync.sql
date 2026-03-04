-- 004_wearable_sync.sql
-- Adds columns for wearable sync tracking and WHOOP workout deduplication

-- Token expiry tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS whoop_token_expires_at TIMESTAMPTZ;

-- Sync timestamps
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_whoop_sync TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_apple_sync TIMESTAMPTZ;

-- WHOOP workout ID for deduplication
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS whoop_workout_id VARCHAR(100);

-- Partial unique index: only enforce uniqueness when whoop_workout_id is set
CREATE UNIQUE INDEX IF NOT EXISTS idx_workout_whoop_dedup
  ON workout_sessions (user_id, whoop_workout_id)
  WHERE whoop_workout_id IS NOT NULL;
