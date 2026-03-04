const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');

module.exports = function(pool, logger) {
  const router = Router();

  // Create challenge
  router.post('/', authMiddleware, async (req, res, next) => {
    try {
      const { defender_studio_id, start_date, end_date, metric } = req.body;

      // Verify challenger owns a studio
      const challenger = await pool.query(
        'SELECT id FROM studios WHERE owner_id = $1',
        [req.userId]
      );
      if (challenger.rows.length === 0) {
        return res.status(403).json({ error: 'You must own a studio to create challenges' });
      }

      const challengerStudioId = challenger.rows[0].id;

      // Verify defender studio exists
      const defender = await pool.query('SELECT id, name FROM studios WHERE id = $1', [defender_studio_id]);
      if (defender.rows.length === 0) {
        return res.status(404).json({ error: 'Defending studio not found' });
      }

      // Can't challenge yourself
      if (challengerStudioId === defender_studio_id) {
        return res.status(400).json({ error: 'Cannot challenge your own studio' });
      }

      const result = await pool.query(
        `INSERT INTO studio_challenges 
         (challenger_studio_id, defender_studio_id, start_date, end_date, metric)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [challengerStudioId, defender_studio_id, start_date, end_date, metric || 'avg_stability']
      );

      logger.info('Challenge created', {
        challengeId: result.rows[0].id,
        challenger: challengerStudioId,
        defender: defender_studio_id,
      });

      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // Get challenge details
  router.get('/:id', async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT sc.*,
         cs.name as challenger_name, cs.slug as challenger_slug,
         ds.name as defender_name, ds.slug as defender_slug
         FROM studio_challenges sc
         JOIN studios cs ON sc.challenger_studio_id = cs.id
         JOIN studios ds ON sc.defender_studio_id = ds.id
         WHERE sc.id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // Accept challenge
  router.patch('/:id/accept', authMiddleware, async (req, res, next) => {
    try {
      const challenge = await pool.query(
        'SELECT * FROM studio_challenges WHERE id = $1',
        [req.params.id]
      );

      if (challenge.rows.length === 0) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      // Verify user owns the defending studio
      const studio = await pool.query(
        'SELECT id FROM studios WHERE id = $1 AND owner_id = $2',
        [challenge.rows[0].defender_studio_id, req.userId]
      );

      if (studio.rows.length === 0) {
        return res.status(403).json({ error: 'Only the defending studio owner can accept' });
      }

      const result = await pool.query(
        "UPDATE studio_challenges SET status = 'active' WHERE id = $1 AND status = 'pending' RETURNING *",
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Challenge cannot be accepted (not pending)' });
      }

      logger.info('Challenge accepted', { challengeId: req.params.id });
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
