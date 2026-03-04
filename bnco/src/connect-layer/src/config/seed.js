// src/config/seed.js - Create test data for bnco connect-layer
// Usage: npm run seed (requires DATABASE_URL in .env)
// NOTE: Does NOT start a server. Connects to DB, inserts seed data, exits.

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Seeding users...');

    const passwordHash = await bcrypt.hash('testpass123', 12);

    // User 1: Studio owner
    const user1 = await client.query(
      `INSERT INTO users (email, password_hash, name, role, auth_provider)
       VALUES ('owner@bnco-test.com', $1, 'Alex Owner', 'studio_admin', 'email')
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [passwordHash]
    );
    const ownerId = user1.rows[0].id;

    // User 2: Athlete
    const user2 = await client.query(
      `INSERT INTO users (email, password_hash, name, role, auth_provider)
       VALUES ('athlete@bnco-test.com', $1, 'Jordan Athlete', 'athlete', 'email')
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [passwordHash]
    );
    const athleteId = user2.rows[0].id;

    console.log('Seeding studio...');

    const studio = await client.query(
      `INSERT INTO studios (name, slug, city, state, owner_id, accent_color)
       VALUES ('Test Pilates Studio', 'test-pilates', 'New York', 'NY', $1, '#4ade80')
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [ownerId]
    );
    const studioId = studio.rows[0].id;

    console.log('Seeding memberships...');

    // Owner membership
    await client.query(
      `INSERT INTO studio_memberships (studio_id, user_id, status, verified_via, approved_at)
       VALUES ($1, $2, 'active', 'manual', NOW())
       ON CONFLICT (studio_id, user_id) DO NOTHING`,
      [studioId, ownerId]
    );

    // Athlete membership
    await client.query(
      `INSERT INTO studio_memberships (studio_id, user_id, status, verified_via, approved_at)
       VALUES ($1, $2, 'active', 'manual', NOW())
       ON CONFLICT (studio_id, user_id) DO NOTHING`,
      [studioId, athleteId]
    );

    console.log('Seeding workout sessions...');

    const now = new Date();
    const workouts = [
      // Owner workouts (last 7 days)
      { userId: ownerId, daysAgo: 1, duration: 55, load: 12.5, variance: 0.15, respRate: 11, source: 'both' },
      { userId: ownerId, daysAgo: 3, duration: 50, load: 10.8, variance: 0.22, respRate: 12, source: 'both' },
      { userId: ownerId, daysAgo: 5, duration: 45, load: 11.0, variance: 0.18, respRate: 10, source: 'whoop' },
      // Athlete workouts
      { userId: athleteId, daysAgo: 0, duration: 60, load: 14.2, variance: 0.10, respRate: 10, source: 'both' },
      { userId: athleteId, daysAgo: 2, duration: 50, load: 9.5, variance: 0.30, respRate: 13, source: 'apple_watch' },
      { userId: athleteId, daysAgo: 4, duration: 55, load: 11.7, variance: 0.20, respRate: 11, source: 'both' },
    ];

    for (const w of workouts) {
      const recordedAt = new Date(now);
      recordedAt.setDate(recordedAt.getDate() - w.daysAgo);

      // Simple inline scoring for seed data
      const loadPerMin = w.load / w.duration;
      const controlScore = loadPerMin >= 5 && loadPerMin <= 15
        ? Math.round(85 + (1 - Math.abs(loadPerMin - 10) / 5) * 15)
        : 50;
      const stillnessScore = w.variance !== null
        ? Math.round((1 - Math.min(1, w.variance)) * 100)
        : null;
      const respiratoryScore = w.respRate >= 8 && w.respRate <= 14
        ? Math.round(90 + (1 - Math.abs(w.respRate - 11) / 3) * 10)
        : 60;

      // Weighted average (handle null stillness)
      let bncoScore;
      if (stillnessScore !== null) {
        bncoScore = Math.round(controlScore * 0.40 + stillnessScore * 0.35 + respiratoryScore * 0.25);
      } else {
        bncoScore = Math.round(controlScore * (0.40 / 0.65) + respiratoryScore * (0.25 / 0.65));
      }

      await client.query(
        `INSERT INTO workout_sessions
         (user_id, studio_id, recorded_at, duration_minutes, source,
          raw_muscular_load, raw_stability_variance, raw_respiratory_rate,
          control_score, stillness_score, respiratory_score, bnco_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          w.userId, studioId, recordedAt.toISOString(), w.duration, w.source,
          w.load, w.variance, w.respRate,
          controlScore, stillnessScore, respiratoryScore, bncoScore,
        ]
      );
    }

    console.log('Seeding weekly goal...');

    // Current week goal
    const weekStart = getWeekStart(now);
    await client.query(
      `INSERT INTO weekly_goals (studio_id, week_start, target_load_units, current_load_units)
       VALUES ($1, $2, 500, 120)
       ON CONFLICT (studio_id, week_start) DO NOTHING`,
      [studioId, weekStart]
    );

    await client.query('COMMIT');
    console.log('Seed complete!');
    console.log(`  Owner ID: ${ownerId}`);
    console.log(`  Athlete ID: ${athleteId}`);
    console.log(`  Studio ID: ${studioId}`);
    console.log(`  Workouts: ${workouts.length}`);
    console.log(`  Weekly goal: 500 load units`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

seed();
