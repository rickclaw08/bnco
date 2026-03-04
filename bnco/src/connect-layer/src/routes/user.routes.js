// NOTE: This module uses the global fetch API, which requires Node 18+.

const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { pullRecentWorkouts, getWhoopProfile } = require('../services/whoop.service');
const {
  calculateControlScore,
  calculateStillnessScore,
  calculateRespiratoryScore,
  calculateBncoScore,
} = require('../services/scoring.service');

module.exports = function(pool, redis, logger) {
  const router = Router();

  // Get current user profile
  router.get('/me', authMiddleware, async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT id, email, name, avatar_url, role, 
         whoop_user_id IS NOT NULL as whoop_connected,
         apple_health_connected, created_at
         FROM users WHERE id = $1`,
        [req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // Update profile
  router.patch('/me', authMiddleware, async (req, res, next) => {
    try {
      const { name, avatar_url } = req.body;
      const updates = [];
      const values = [];
      let idx = 1;

      if (name) { updates.push(`name = $${idx++}`); values.push(name); }
      if (avatar_url) { updates.push(`avatar_url = $${idx++}`); values.push(avatar_url); }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = NOW()`);
      values.push(req.userId);

      const result = await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email, name, avatar_url, role`,
        values
      );

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // ── Device Endpoints ──────────────────────────────────────

  // Get all connected devices for the user
  router.get('/me/devices', authMiddleware, async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT id, whoop_user_id, whoop_token IS NOT NULL as whoop_connected,
         apple_health_connected
         FROM users WHERE id = $1`,
        [req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      const devices = [];

      if (user.whoop_connected) {
        devices.push({
          provider: 'whoop',
          type: 'whoop',
          connected: true,
          username: user.whoop_user_id || 'WHOOP User',
          name: 'WHOOP',
          status: 'syncing',
        });
      }

      if (user.apple_health_connected) {
        devices.push({
          provider: 'apple_watch',
          type: 'apple_watch',
          connected: true,
          name: 'Apple Watch',
          status: 'syncing',
        });
      }

      res.json({ devices });
    } catch (err) {
      next(err);
    }
  });

  // Connect WHOOP (initiate OAuth)
  router.post('/me/devices/whoop', authMiddleware, async (req, res) => {
    const whoopClientId = process.env.WHOOP_CLIENT_ID;
    const whoopRedirectUri = process.env.WHOOP_REDIRECT_URI;

    if (!whoopClientId || !whoopRedirectUri) {
      // Return a stub/mock OAuth URL for development
      logger.info('WHOOP OAuth requested (stub mode - no credentials configured)', { userId: req.userId });
      return res.json({
        auth_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?whoop=connected`,
        stub: true,
      });
    }

    const whoopAuthUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?` +
      `client_id=${whoopClientId}` +
      `&redirect_uri=${encodeURIComponent(whoopRedirectUri)}` +
      `&response_type=code` +
      `&scope=read:profile read:workout` +
      `&state=${req.userId}`;

    res.json({ auth_url: whoopAuthUrl });
  });

  // WHOOP OAuth callback
  router.get('/me/devices/whoop/callback', async (req, res, next) => {
    try {
      const { code, state: userId } = req.query;

      if (!process.env.WHOOP_CLIENT_ID || !process.env.WHOOP_CLIENT_SECRET) {
        // Stub mode: simulate successful connection
        logger.info('WHOOP callback (stub mode)', { userId });
        if (userId) {
          await pool.query(
            `UPDATE users SET whoop_user_id = $1, updated_at = NOW() WHERE id = $2`,
            ['stub_whoop_user', userId]
          );
        }
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?whoop=connected`);
      }

      // Exchange code for tokens
      // NOTE: Requires Node 18+ for native global fetch
      const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: process.env.WHOOP_CLIENT_ID,
          client_secret: process.env.WHOOP_CLIENT_SECRET,
          redirect_uri: process.env.WHOOP_REDIRECT_URI,
        }),
      });

      const tokens = await tokenRes.json();

      // Get WHOOP user ID
      const profileRes = await fetch('https://api.prod.whoop.com/developer/v1/user/profile/basic', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const profile = await profileRes.json();

      // Store tokens (including expiry for automatic refresh)
      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null;

      await pool.query(
        `UPDATE users SET whoop_token = $1, whoop_refresh_token = $2, whoop_user_id = $3,
         whoop_token_expires_at = $4, updated_at = NOW() WHERE id = $5`,
        [tokens.access_token, tokens.refresh_token, profile.user_id, expiresAt, userId]
      );

      logger.info('WHOOP connected', { userId, whoopUserId: profile.user_id });
      res.redirect(`${process.env.FRONTEND_URL}/settings?whoop=connected`);
    } catch (err) {
      next(err);
    }
  });

  // Disconnect WHOOP
  router.delete('/me/devices/whoop', authMiddleware, async (req, res, next) => {
    try {
      await pool.query(
        `UPDATE users SET whoop_token = NULL, whoop_refresh_token = NULL, whoop_user_id = NULL, updated_at = NOW() WHERE id = $1`,
        [req.userId]
      );

      logger.info('WHOOP disconnected', { userId: req.userId });
      res.json({ disconnected: true });
    } catch (err) {
      next(err);
    }
  });

  // Confirm Apple Watch connection
  router.post('/me/devices/apple', authMiddleware, async (req, res, next) => {
    try {
      await pool.query(
        'UPDATE users SET apple_health_connected = true, updated_at = NOW() WHERE id = $1',
        [req.userId]
      );

      logger.info('Apple Watch connected', { userId: req.userId });
      res.json({ connected: true });
    } catch (err) {
      next(err);
    }
  });

  // ── WHOOP Manual Sync ─────────────────────────────────────

  // Trigger an active data pull from WHOOP API
  router.post('/me/devices/whoop/sync', authMiddleware, async (req, res, next) => {
    try {
      // Check user has WHOOP connected
      const userCheck = await pool.query(
        'SELECT whoop_token, whoop_user_id FROM users WHERE id = $1',
        [req.userId]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!userCheck.rows[0].whoop_token) {
        return res.status(400).json({ error: 'WHOOP not connected. Please connect WHOOP first.' });
      }

      const result = await pullRecentWorkouts(pool, req.userId, logger);

      logger.info('WHOOP manual sync triggered', { userId: req.userId, result });
      res.json({
        message: 'WHOOP sync complete',
        synced: result.synced,
        skipped: result.skipped,
        total: result.total,
      });
    } catch (err) {
      logger.error('WHOOP sync failed', { userId: req.userId, error: err.message });
      next(err);
    }
  });

  // Get WHOOP sync status
  router.get('/me/devices/whoop/status', authMiddleware, async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT whoop_user_id, last_whoop_sync,
         whoop_token IS NOT NULL as connected
         FROM users WHERE id = $1`,
        [req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      res.json({
        connected: user.connected,
        whoop_user_id: user.whoop_user_id,
        last_sync: user.last_whoop_sync,
      });
    } catch (err) {
      next(err);
    }
  });

  // ── Apple Health Data Sync ────────────────────────────────

  // Accept workout data from Apple Health (via iOS app or any client)
  router.post('/me/devices/apple/sync', authMiddleware, async (req, res, next) => {
    try {
      const { workouts } = req.body;

      if (!Array.isArray(workouts) || workouts.length === 0) {
        return res.status(400).json({ error: 'workouts array is required and must not be empty' });
      }

      if (workouts.length > 100) {
        return res.status(400).json({ error: 'Maximum 100 workouts per sync request' });
      }

      // Get user's studio
      const studioResult = await pool.query(
        'SELECT studio_id FROM studio_memberships WHERE user_id = $1 LIMIT 1',
        [req.userId]
      );
      const studioId = studioResult.rows.length > 0 ? studioResult.rows[0].studio_id : null;

      const results = [];
      let inserted = 0;
      let errors = 0;

      for (const w of workouts) {
        // Validate required fields
        if (!w.recorded_at || !w.duration_minutes) {
          results.push({ recorded_at: w.recorded_at, status: 'error', reason: 'recorded_at and duration_minutes required' });
          errors++;
          continue;
        }

        const recordedAt = new Date(w.recorded_at);
        if (isNaN(recordedAt.getTime())) {
          results.push({ recorded_at: w.recorded_at, status: 'error', reason: 'Invalid recorded_at date' });
          errors++;
          continue;
        }

        const durationMinutes = parseInt(w.duration_minutes, 10);
        if (durationMinutes < 1 || durationMinutes > 300) {
          results.push({ recorded_at: w.recorded_at, status: 'error', reason: 'duration_minutes must be 1-300' });
          errors++;
          continue;
        }

        // Calculate scores
        const controlScore = calculateControlScore(w.raw_muscular_load || null, durationMinutes);
        const stillnessScore = calculateStillnessScore(w.stability_variance != null ? w.stability_variance : null);
        const respiratoryScore = calculateRespiratoryScore(w.respiratory_rate || null);
        const bncoScore = calculateBncoScore(controlScore, stillnessScore, respiratoryScore);

        try {
          await pool.query(
            `INSERT INTO workout_sessions
             (user_id, studio_id, recorded_at, duration_minutes, source,
              raw_muscular_load, raw_stability_variance, raw_respiratory_rate, raw_hrv,
              control_score, stillness_score, respiratory_score, bnco_score)
             VALUES ($1, $2, $3, $4, 'apple_watch', $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              req.userId, studioId, recordedAt, durationMinutes,
              w.raw_muscular_load || null,
              w.stability_variance != null ? w.stability_variance : null,
              w.respiratory_rate || null,
              w.hrv || null,
              controlScore, stillnessScore, respiratoryScore, bncoScore,
            ]
          );
          results.push({ recorded_at: w.recorded_at, status: 'inserted', bnco_score: bncoScore });
          inserted++;
        } catch (err) {
          results.push({ recorded_at: w.recorded_at, status: 'error', reason: err.message });
          errors++;
        }
      }

      // Mark Apple Health as connected and update last sync
      await pool.query(
        'UPDATE users SET apple_health_connected = true, last_apple_sync = NOW(), updated_at = NOW() WHERE id = $1',
        [req.userId]
      );

      logger.info('Apple Health sync complete', { userId: req.userId, inserted, errors, total: workouts.length });
      res.json({
        message: 'Apple Health sync complete',
        inserted,
        errors,
        total: workouts.length,
        results,
      });
    } catch (err) {
      logger.error('Apple Health sync failed', { userId: req.userId, error: err.message });
      next(err);
    }
  });

  // Get Apple Health sync status
  router.get('/me/devices/apple/status', authMiddleware, async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT apple_health_connected as connected, last_apple_sync as last_sync
         FROM users WHERE id = $1`,
        [req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
