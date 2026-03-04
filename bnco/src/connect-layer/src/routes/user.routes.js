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

  // Connect WHOOP (initiate OAuth)
  router.post('/me/devices/whoop', authMiddleware, async (req, res) => {
    const whoopAuthUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?` +
      `client_id=${process.env.WHOOP_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.WHOOP_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=read:profile read:workout` +
      `&state=${req.userId}`;

    res.json({ auth_url: whoopAuthUrl });
  });

  // WHOOP OAuth callback
  router.get('/me/devices/whoop/callback', async (req, res, next) => {
    try {
      const { code, state: userId } = req.query;

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
