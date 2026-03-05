const { Router } = require('express');
const Joi = require('joi');
const { authMiddleware, requireRole } = require('../middleware/auth');

module.exports = function(pool, redis, logger) {
  const router = Router();

  const createStudioSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    slug: Joi.string().min(1).max(100).pattern(/^[a-z0-9-]+$/).required(),
    city: Joi.string().max(100),
    state: Joi.string().max(50),
    accent_color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).default('#4ade80'),
  });

  // Create studio
  router.post('/', authMiddleware, async (req, res, next) => {
    try {
      const { error, value } = createStudioSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const { name, slug, city, state, accent_color } = value;

      // Check slug uniqueness
      const existing = await pool.query('SELECT id FROM studios WHERE slug = $1', [slug]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Studio slug already taken' });
      }

      const result = await pool.query(
        `INSERT INTO studios (name, slug, city, state, owner_id, accent_color)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, slug, city, state, req.userId, accent_color]
      );

      // Update user role to studio_admin
      await pool.query(
        "UPDATE users SET role = 'studio_admin', updated_at = NOW() WHERE id = $1",
        [req.userId]
      );

      // Auto-join owner as active member
      await pool.query(
        `INSERT INTO studio_memberships (studio_id, user_id, status, verified_via, approved_at)
         VALUES ($1, $2, 'active', 'manual', NOW())`,
        [result.rows[0].id, req.userId]
      );

      logger.info('Studio created', { studioId: result.rows[0].id, slug });
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // Get studio
  router.get('/:id', async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT s.*, u.name as owner_name,
         (SELECT COUNT(*) FROM studio_memberships WHERE studio_id = s.id) as member_count
         FROM studios s JOIN users u ON s.owner_id = u.id
         WHERE s.id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Studio not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // Join studio
  router.post('/:id/join', authMiddleware, async (req, res, next) => {
    try {
      const studioId = req.params.id;

      // Verify studio exists
      const studio = await pool.query('SELECT id FROM studios WHERE id = $1', [studioId]);
      if (studio.rows.length === 0) {
        return res.status(404).json({ error: 'Studio not found' });
      }

      // Check not already a member
      const existing = await pool.query(
        'SELECT id FROM studio_memberships WHERE studio_id = $1 AND user_id = $2',
        [studioId, req.userId]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Already a member' });
      }

      await pool.query(
        `INSERT INTO studio_memberships (studio_id, user_id, status, requested_at)
         VALUES ($1, $2, 'pending', NOW())`,
        [studioId, req.userId]
      );

      logger.info('User joined studio', { userId: req.userId, studioId });
      res.status(201).json({ joined: true });
    } catch (err) {
      next(err);
    }
  });

  // Precision Leaderboard
  router.get('/:id/leaderboard', async (req, res, next) => {
    try {
      const period = req.query.period || 'week';
      let dateFilter = "AND ws.recorded_at >= NOW() - INTERVAL '7 days'";
      if (period === 'month') {
        dateFilter = "AND ws.recorded_at >= NOW() - INTERVAL '30 days'";
      }

      const result = await pool.query(
        `SELECT u.id, u.name, u.avatar_url,
         ROUND(AVG(ws.bnco_score)) as avg_bnco_score,
         ROUND(AVG(ws.stillness_score)) as avg_stillness,
         COUNT(ws.id) as session_count
         FROM studio_memberships sm
         JOIN users u ON sm.user_id = u.id
         LEFT JOIN workout_sessions ws ON ws.user_id = u.id AND ws.studio_id = $1 ${dateFilter}
         WHERE sm.studio_id = $1 AND sm.show_on_leaderboard = true AND sm.status = 'active'
         GROUP BY u.id, u.name, u.avatar_url
         HAVING COUNT(ws.id) > 0
         ORDER BY avg_bnco_score DESC NULLS LAST
         LIMIT 50`,
        [req.params.id]
      );

      res.json({ leaderboard: result.rows, period });
    } catch (err) {
      next(err);
    }
  });

  // Current weekly goal
  router.get('/:id/goal', async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT * FROM weekly_goals WHERE studio_id = $1
         ORDER BY week_start DESC LIMIT 1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.json({ goal: null });
      }

      const goal = result.rows[0];
      const progress = goal.target_load_units > 0
        ? Math.min(100, Math.round((goal.current_load_units / goal.target_load_units) * 100))
        : 0;

      res.json({ goal: { ...goal, progress_percent: progress } });
    } catch (err) {
      next(err);
    }
  });

  // Set weekly goal (admin only)
  router.post('/:id/goal', authMiddleware, async (req, res, next) => {
    try {
      const studioId = req.params.id;

      // Verify ownership
      const studio = await pool.query('SELECT owner_id FROM studios WHERE id = $1', [studioId]);
      if (studio.rows.length === 0) return res.status(404).json({ error: 'Studio not found' });
      if (studio.rows[0].owner_id !== req.userId) {
        return res.status(403).json({ error: 'Only the studio owner can set goals' });
      }

      const { target_load_units } = req.body;
      if (!target_load_units || target_load_units < 1) {
        return res.status(400).json({ error: 'target_load_units must be positive' });
      }

      const weekStart = getWeekStart(new Date());
      const result = await pool.query(
        `INSERT INTO weekly_goals (studio_id, week_start, target_load_units)
         VALUES ($1, $2, $3)
         ON CONFLICT (studio_id, week_start)
         DO UPDATE SET target_load_units = $3
         RETURNING *`,
        [studioId, weekStart, target_load_units]
      );

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // List members (admin)
  router.get('/:id/members', authMiddleware, async (req, res, next) => {
    try {
      const studioId = req.params.id;
      const studio = await pool.query('SELECT owner_id FROM studios WHERE id = $1', [studioId]);
      if (studio.rows.length === 0) return res.status(404).json({ error: 'Studio not found' });
      if (studio.rows[0].owner_id !== req.userId) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.avatar_url, sm.joined_at, sm.show_on_leaderboard,
         (SELECT ROUND(AVG(bnco_score)) FROM workout_sessions 
          WHERE user_id = u.id AND studio_id = $1 AND recorded_at >= NOW() - INTERVAL '30 days') as avg_score_30d
         FROM studio_memberships sm JOIN users u ON sm.user_id = u.id
         WHERE sm.studio_id = $1 ORDER BY sm.joined_at`,
        [studioId]
      );

      res.json({ members: result.rows });
    } catch (err) {
      next(err);
    }
  });

  // At-risk members (admin)
  router.get('/:id/at-risk', authMiddleware, async (req, res, next) => {
    try {
      const studioId = req.params.id;
      const studio = await pool.query('SELECT owner_id FROM studios WHERE id = $1', [studioId]);
      if (studio.rows.length === 0) return res.status(404).json({ error: 'Studio not found' });
      if (studio.rows[0].owner_id !== req.userId) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Members with declining scores or no recent activity
      const result = await pool.query(
        `SELECT u.id, u.name, u.email,
         (SELECT ROUND(AVG(bnco_score)) FROM workout_sessions 
          WHERE user_id = u.id AND recorded_at >= NOW() - INTERVAL '7 days') as avg_score_7d,
         (SELECT ROUND(AVG(bnco_score)) FROM workout_sessions 
          WHERE user_id = u.id AND recorded_at >= NOW() - INTERVAL '30 days') as avg_score_30d,
         (SELECT MAX(recorded_at) FROM workout_sessions 
          WHERE user_id = u.id AND studio_id = $1) as last_workout
         FROM studio_memberships sm JOIN users u ON sm.user_id = u.id
         WHERE sm.studio_id = $1
         AND (
           (SELECT MAX(recorded_at) FROM workout_sessions WHERE user_id = u.id AND studio_id = $1) 
           < NOW() - INTERVAL '14 days'
           OR
           (SELECT AVG(bnco_score) FROM workout_sessions 
            WHERE user_id = u.id AND recorded_at >= NOW() - INTERVAL '7 days')
           < (SELECT AVG(bnco_score) FROM workout_sessions 
              WHERE user_id = u.id AND recorded_at >= NOW() - INTERVAL '30 days') * 0.8
         )`,
        [studioId]
      );

      res.json({ at_risk: result.rows });
    } catch (err) {
      next(err);
    }
  });

  // ── Join Code Endpoints ─────────────────────────────────

  // Join studio via code (any authenticated user)
  // NOTE: This route MUST be before /:id routes to avoid matching "join-by-code" as :id
  router.post('/join-by-code', authMiddleware, async (req, res, next) => {
    try {
      const { code } = req.body;
      if (!code || code.length < 4) {
        return res.status(400).json({ error: 'Invalid join code' });
      }

      const studio = await pool.query(
        'SELECT id, name, slug FROM studios WHERE UPPER(join_code) = UPPER($1)',
        [code.trim()]
      );

      if (studio.rows.length === 0) {
        return res.status(404).json({ error: 'No studio found with that code' });
      }

      const studioId = studio.rows[0].id;

      // Check if already a member
      const existing = await pool.query(
        'SELECT id, status FROM studio_memberships WHERE studio_id = $1 AND user_id = $2',
        [studioId, req.userId]
      );

      if (existing.rows.length > 0) {
        if (existing.rows[0].status === 'active') {
          return res.status(409).json({ error: 'Already a member of this studio', studio: studio.rows[0] });
        }
        // Re-activate if previously denied/expired
        await pool.query(
          `UPDATE studio_memberships SET status = 'active', approved_at = NOW()
           WHERE studio_id = $1 AND user_id = $2`,
          [studioId, req.userId]
        );
      } else {
        // Create new membership - auto-approve since they have the code
        await pool.query(
          `INSERT INTO studio_memberships (studio_id, user_id, status, verified_via, approved_at, requested_at)
           VALUES ($1, $2, 'active', 'join_code', NOW(), NOW())`,
          [studioId, req.userId]
        );
      }

      logger.info('User joined studio via code', { userId: req.userId, studioId, code });
      res.json({ joined: true, studio: studio.rows[0] });
    } catch (err) {
      next(err);
    }
  });

  // Generate/get join code for a studio (owner only)
  router.get('/:id/join-code', authMiddleware, async (req, res, next) => {
    try {
      const studioId = req.params.id;
      const studio = await pool.query('SELECT owner_id, join_code FROM studios WHERE id = $1', [studioId]);
      if (studio.rows.length === 0) return res.status(404).json({ error: 'Studio not found' });
      if (studio.rows[0].owner_id !== req.userId) {
        return res.status(403).json({ error: 'Only the studio owner can view the join code' });
      }

      let code = studio.rows[0].join_code;
      if (!code) {
        // Generate one
        code = generateJoinCode();
        await pool.query('UPDATE studios SET join_code = $1 WHERE id = $2', [code, studioId]);
      }

      res.json({ join_code: code, studio_id: studioId });
    } catch (err) {
      next(err);
    }
  });

  return router;
};

function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I,O,0,1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}
