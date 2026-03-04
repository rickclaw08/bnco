-- bnco Database Migration 003 - Fix password_hash nullable for OAuth users
-- Run after 002_onboarding.sql

-- Allow NULL password_hash for Google OAuth signups
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Drop the unused password_hash_nullable column added in 002
ALTER TABLE users DROP COLUMN IF EXISTS password_hash_nullable;
