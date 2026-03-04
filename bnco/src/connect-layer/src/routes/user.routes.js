// NOTE: This module uses the global fetch API, which requires Node 18+.

const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');

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

      // Store tokens
      await pool.query(
        `UPDATE users SET whoop_token = $1, whoop_refresh_token = $2, whoop_user_id = $3, updated_at = NOW() WHERE id = $4`,
        [tokens.access_token, tokens.refresh_token, profile.user_id, userId]
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

  return router;
};
