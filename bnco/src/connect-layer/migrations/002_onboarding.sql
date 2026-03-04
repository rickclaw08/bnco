-- bnco Database Schema v2 - Onboarding & Verification
-- Run after 001_initial.sql

-- User onboarding data
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  pilates_frequency VARCHAR(50), -- "3 days a week", "daily", etc.
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Google OAuth fields to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email' CHECK (auth_provider IN ('email', 'google'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash_nullable VARCHAR(255); -- Google users may not have a password

-- Make password_hash nullable for Google signups
-- (In practice: new signups via Google set password_hash to NULL)
-- ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Replace studio_members with studio_memberships (richer model)
DROP TABLE IF EXISTS studio_members;

CREATE TABLE IF NOT EXISTS studio_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES studios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'denied', 'expired')),
  verified_via VARCHAR(20) CHECK (verified_via IN ('manual', 'billing_auto', 'invite_code')),
  billing_customer_id VARCHAR(255), -- cross-ref to studio's billing system
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  UNIQUE(studio_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_studio_status ON studio_memberships(studio_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON studio_memberships(user_id);

-- Studio billing integration
CREATE TABLE IF NOT EXISTS studio_billing_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES studios(id) ON DELETE CASCADE UNIQUE,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('mindbody', 'mariana_tek', 'stripe', 'manual')),
  api_key_encrypted TEXT, -- encrypted at rest
  api_endpoint VARCHAR(500),
  last_synced_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update workout_sessions FK to use studio_memberships for validation
-- (No schema change needed, just application logic)
