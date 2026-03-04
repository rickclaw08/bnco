const { Router } = require('express');
const Joi = require('joi');
const { authMiddleware, requireRole } = require('../middleware/auth');

module.exports = function(pool, redis, logger) {
  const router = Router();

  // Get pending membership requests (studio admin)
  router.get('/:studioId/requests', authMiddleware, async (req, res, next) => {
    try {
      const { studioId } = req.params;

      // Verify ownership
      const studio = await pool.query('SELECT owner_id FROM studios WHERE id = $1', [studioId]);
      if (studio.rows.length === 0) return res.status(404).json({ error: 'Studio not found' });
      if (studio.rows[0].owner_id !== req.userId) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const result = await pool.query(
        `SELECT sm.id, sm.user_id, sm.status, sm.requested_at,
         u.name, u.email, u.avatar_url
         FROM studio_memberships sm
         JOIN users u ON sm.user_id = u.id
         WHERE sm.studio_id = $1 AND sm.status = 'pending'
         ORDER BY sm.requested_at`,
        [studioId]
      );

      res.json({ requests: result.rows });
    } catch (err) {
      next(err);
    }
  });

  // Approve membership (studio admin)
  router.post('/:studioId/requests/:membershipId/approve', authMiddleware, async (req, res, next) => {
    try {
      const { studioId, membershipId } = req.params;

      // Verify ownership
      const studio = await pool.query('SELECT owner_id FROM studios WHERE id = $1', [studioId]);
      if (studio.rows.length === 0) return res.status(404).json({ error: 'Studio not found' });
      if (studio.rows[0].owner_id !== req.userId) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const result = await pool.query(
        `UPDATE studio_memberships 
         SET status = 'active', verified_via = 'manual', approved_at = NOW()
         WHERE id = $1 AND studio_id = $2 AND status = 'pending'
         RETURNING *`,
        [membershipId, studioId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pending request not found' });
      }

      logger.info('Membership approved', { studioId, membershipId });
      res.json({ approved: true, membership: result.rows[0] });
    } catch (err) {
      next(err);
    }
  });

  // Deny membership (studio admin)
  router.post('/:studioId/requests/:membershipId/deny', authMiddleware, async (req, res, next) => {
    try {
      const { studioId, membershipId } = req.params;

      const studio = await pool.query('SELECT owner_id FROM studios WHERE id = $1', [studioId]);
      if (studio.rows.length === 0) return res.status(404).json({ error: 'Studio not found' });
      if (studio.rows[0].owner_id !== req.userId) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const result = await pool.query(
        `UPDATE studio_memberships SET status = 'denied'
         WHERE id = $1 AND studio_id = $2 AND status = 'pending'
         RETURNING *`,
        [membershipId, studioId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pending request not found' });
      }

      res.json({ denied: true });
    } catch (err) {
      next(err);
    }
  });

  // Configure billing integration (studio admin)
  router.post('/:studioId/billing', authMiddleware, async (req, res, next) => {
    try {
      const { studioId } = req.params;

      const studio = await pool.query('SELECT owner_id FROM studios WHERE id = $1', [studioId]);
      if (studio.rows.length === 0) return res.status(404).json({ error: 'Studio not found' });
      if (studio.rows[0].owner_id !== req.userId) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { provider, api_key, api_endpoint } = req.body;

      if (!['mindbody', 'mariana_tek', 'stripe', 'manual'].includes(provider)) {
        return res.status(400).json({ error: 'Invalid billing provider' });
      }

      // In production: encrypt api_key before storing
      const result = await pool.query(
        `INSERT INTO studio_billing_integrations (studio_id, provider, api_key_encrypted, api_endpoint)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (studio_id) DO UPDATE SET
           provider = $2, api_key_encrypted = $3, api_endpoint = $4, last_synced_at = NOW()
         RETURNING id, studio_id, provider, active`,
        [studioId, provider, api_key, api_endpoint] // TODO: encrypt api_key
      );

      logger.info('Billing integration configured', { studioId, provider });
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // Get all members with status (studio admin view)
  router.get('/:studioId/members', authMiddleware, async (req, res, next) => {
    try {
      const { studioId } = req.params;
      const status = req.query.status || 'active'; // pending, active, denied, expired

      const studio = await pool.query('SELECT owner_id FROM studios WHERE id = $1', [studioId]);
      if (studio.rows.length === 0) return res.status(404).json({ error: 'Studio not found' });
      if (studio.rows[0].owner_id !== req.userId) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const result = await pool.query(
        `SELECT sm.id as membership_id, sm.status, sm.verified_via, sm.requested_at, sm.approved_at,
         u.id as user_id, u.name, u.email, u.avatar_url,
         (SELECT ROUND(AVG(bnco_score)) FROM workout_sessions 
          WHERE user_id = u.id AND studio_id = $1 
          AND recorded_at >= NOW() - INTERVAL '30 days') as avg_score_30d,
         (SELECT COUNT(*) FROM workout_sessions 
          WHERE user_id = u.id AND studio_id = $1
          AND recorded_at >= NOW() - INTERVAL '30 days') as sessions_30d
         FROM studio_memberships sm JOIN users u ON sm.user_id = u.id
         WHERE sm.studio_id = $1 AND sm.status = $2
         ORDER BY sm.requested_at DESC`,
        [studioId, status]
      );

      res.json({ members: result.rows, status });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
