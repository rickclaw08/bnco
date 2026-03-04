// src/services/whoop.service.js
// Active WHOOP data pull service - fetches workouts from WHOOP API v1
// and inserts them into the database with bnco scoring.

const whoopConfig = require('../config/whoop');
const {
  calculateControlScore,
  calculateRespiratoryScore,
  calculateBncoScore,
} = require('./scoring.service');

/**
 * Refresh an expired WHOOP access token using the stored refresh token.
 * Updates the database with the new tokens and expiry.
 * @param {import('pg').Pool} pool
 * @param {string} userId
 * @returns {Promise<string>} fresh access token
 */
async function refreshWhoopToken(pool, userId) {
  const userResult = await pool.query(
    'SELECT whoop_refresh_token FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0 || !userResult.rows[0].whoop_refresh_token) {
    throw new Error('No WHOOP refresh token stored for user');
  }

  const refreshToken = userResult.rows[0].whoop_refresh_token;

  const res = await fetch(`${whoopConfig.oauthUrl}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: whoopConfig.clientId,
      client_secret: whoopConfig.clientSecret,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WHOOP token refresh failed (${res.status}): ${body}`);
  }

  const tokens = await res.json();
  const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);

  await pool.query(
    `UPDATE users
     SET whoop_token = $1,
         whoop_refresh_token = $2,
         whoop_token_expires_at = $3,
         updated_at = NOW()
     WHERE id = $4`,
    [tokens.access_token, tokens.refresh_token || refreshToken, expiresAt, userId]
  );

  return tokens.access_token;
}

/**
 * Get a valid WHOOP access token for the user, refreshing if expired.
 * @param {import('pg').Pool} pool
 * @param {string} userId
 * @returns {Promise<string>} access token
 */
async function getValidToken(pool, userId) {
  const result = await pool.query(
    'SELECT whoop_token, whoop_token_expires_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0 || !result.rows[0].whoop_token) {
    throw new Error('User has no WHOOP connection');
  }

  const { whoop_token, whoop_token_expires_at } = result.rows[0];

  // Refresh if token is expired or will expire within 5 minutes
  const bufferMs = 5 * 60 * 1000;
  if (whoop_token_expires_at && new Date(whoop_token_expires_at).getTime() < Date.now() + bufferMs) {
    return refreshWhoopToken(pool, userId);
  }

  return whoop_token;
}

/**
 * Fetch the basic WHOOP user profile.
 * @param {import('pg').Pool} pool
 * @param {string} userId
 * @returns {Promise<Object>} profile data
 */
async function getWhoopProfile(pool, userId) {
  const token = await getValidToken(pool, userId);

  const res = await fetch(`${whoopConfig.apiUrl}/user/profile/basic`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`WHOOP profile fetch failed (${res.status})`);
  }

  return res.json();
}

/**
 * Pull recent workouts from WHOOP API and insert into workout_sessions.
 * Skips duplicates by checking whoop_workout_id.
 *
 * @param {import('pg').Pool} pool
 * @param {string} userId
 * @param {Object} [logger] - optional logger
 * @returns {Promise<{synced: number, skipped: number, total: number}>}
 */
async function pullRecentWorkouts(pool, userId, logger) {
  const token = await getValidToken(pool, userId);

  // Fetch workouts from WHOOP API (last 30 days by default)
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const url = `${whoopConfig.apiUrl}/activity/workout?start=${encodeURIComponent(startDate)}&limit=50`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    // If 401, try refresh once
    if (res.status === 401) {
      const freshToken = await refreshWhoopToken(pool, userId);
      const retryRes = await fetch(url, {
        headers: { Authorization: `Bearer ${freshToken}` },
      });
      if (!retryRes.ok) {
        throw new Error(`WHOOP workout fetch failed after refresh (${retryRes.status})`);
      }
      var workoutData = await retryRes.json();
    } else {
      throw new Error(`WHOOP workout fetch failed (${res.status})`);
    }
  } else {
    var workoutData = await res.json();
  }

  const workouts = workoutData.records || workoutData || [];

  if (!Array.isArray(workouts)) {
    if (logger) logger.warn('WHOOP returned unexpected workout format', { userId, data: workoutData });
    return { synced: 0, skipped: 0, total: 0 };
  }

  // Get user's studio
  const studioResult = await pool.query(
    'SELECT studio_id FROM studio_memberships WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  const studioId = studioResult.rows.length > 0 ? studioResult.rows[0].studio_id : null;

  let synced = 0;
  let skipped = 0;

  for (const workout of workouts) {
    const whoopWorkoutId = String(workout.id);
    const sportId = workout.sport_id;
    const strain = workout.score?.strain || workout.strain;
    const avgHR = workout.score?.average_heart_rate || workout.average_heart_rate;
    const maxHR = workout.score?.max_heart_rate || workout.max_heart_rate;

    // Duration: WHOOP provides start/end timestamps
    let durationMinutes = 0;
    if (workout.start && workout.end) {
      durationMinutes = Math.round((new Date(workout.end) - new Date(workout.start)) / 60000);
    } else if (workout.score?.duration_millis) {
      durationMinutes = Math.round(workout.score.duration_millis / 60000);
    }

    // Respiratory rate is not always in workout data; may be in recovery cycle
    const respiratoryRate = workout.score?.respiratory_rate || null;

    // Calculate bnco scores
    const controlScore = calculateControlScore(strain, durationMinutes);
    const respiratoryScore = calculateRespiratoryScore(respiratoryRate);
    const bncoScore = calculateBncoScore(controlScore, null, respiratoryScore);

    const recordedAt = workout.start || workout.created_at || new Date().toISOString();

    try {
      await pool.query(
        `INSERT INTO workout_sessions
         (user_id, studio_id, recorded_at, duration_minutes, source,
          raw_muscular_load, raw_respiratory_rate, raw_hrv,
          control_score, respiratory_score, bnco_score, whoop_workout_id)
         VALUES ($1, $2, $3, $4, 'whoop', $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (user_id, whoop_workout_id) WHERE whoop_workout_id IS NOT NULL
         DO NOTHING`,
        [
          userId, studioId, recordedAt, durationMinutes,
          strain, respiratoryRate, workout.score?.hrv || null,
          controlScore, respiratoryScore, bncoScore, whoopWorkoutId,
        ]
      );
      synced++;
    } catch (err) {
      // Duplicate or constraint error - skip
      if (err.code === '23505') {
        skipped++;
      } else {
        if (logger) logger.error('Error inserting WHOOP workout', { userId, whoopWorkoutId, error: err.message });
        skipped++;
      }
    }
  }

  // Update last sync timestamp
  await pool.query(
    'UPDATE users SET last_whoop_sync = NOW(), updated_at = NOW() WHERE id = $1',
    [userId]
  );

  if (logger) logger.info('WHOOP sync complete', { userId, synced, skipped, total: workouts.length });

  return { synced, skipped, total: workouts.length };
}

module.exports = {
  refreshWhoopToken,
  getValidToken,
  getWhoopProfile,
  pullRecentWorkouts,
};
