const { Router } = require('express');
const crypto = require('crypto');
const {
  calculateControlScore,
  calculateRespiratoryScore,
  calculateBncoScore,
} = require('../services/scoring.service');

module.exports = function(pool, redis, logger) {
  const router = Router();

  // WHOOP webhook - workout completion
  router.post('/whoop', async (req, res, next) => {
    try {
      // Verify webhook signature
      const signature = req.headers['x-whoop-signature'];
      if (process.env.WHOOP_WEBHOOK_SECRET && signature) {
        const expected = crypto
          .createHmac('sha256', process.env.WHOOP_WEBHOOK_SECRET)
          .update(JSON.stringify(req.body))
          .digest('hex');

        if (signature !== expected) {
          logger.warn('Invalid WHOOP webhook signature');
          return res.status(401).json({ error: 'Invalid signature' });
        }
      }

      const {
        user_id: whoopUserId,
        event_type,
        data,
      } = req.body;

      // Only process workout events
      if (event_type !== 'workout.completed') {
        return res.status(200).json({ ignored: true, reason: 'not a workout event' });
      }

      const {
        sport_id,
        muscular_strain,
        respiratory_rate,
        hrv_impact,
        duration_seconds,
      } = data || {};

      // Sport ID 63 = Pilates in WHOOP (may vary, check WHOOP docs)
      // Accept all sports initially, filter later
      // if (sport_id !== 63) {
      //   return res.status(200).json({ ignored: true, reason: 'not pilates' });
      // }

      // Find bnco user by WHOOP user ID
      const userResult = await pool.query(
        'SELECT id FROM users WHERE whoop_user_id = $1',
        [whoopUserId]
      );

      if (userResult.rows.length === 0) {
        return res.status(200).json({ ignored: true, reason: 'user not found' });
      }

      const userId = userResult.rows[0].id;
      const durationMinutes = Math.round((duration_seconds || 0) / 60);

      // Calculate scores from WHOOP data
      const controlScore = calculateControlScore(muscular_strain, durationMinutes);
      const respiratoryScore = calculateRespiratoryScore(respiratory_rate);

      // Get user's studio
      const studioResult = await pool.query(
        'SELECT studio_id FROM studio_memberships WHERE user_id = $1 LIMIT 1',
        [userId]
      );
      const studioId = studioResult.rows.length > 0 ? studioResult.rows[0].studio_id : null;

      // bnco score (partial - no stillness without Apple Watch data)
      const bncoScore = calculateBncoScore(controlScore, null, respiratoryScore);

      // Insert workout
      const workoutResult = await pool.query(
        `INSERT INTO workout_sessions 
         (user_id, studio_id, recorded_at, duration_minutes, source,
          raw_muscular_load, raw_respiratory_rate, raw_hrv,
          control_score, respiratory_score, bnco_score)
         VALUES ($1, $2, NOW(), $3, 'whoop', $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [userId, studioId, durationMinutes, muscular_strain, respiratory_rate,
         hrv_impact, controlScore, respiratoryScore, bncoScore]
      );

      // Update studio weekly goal
      if (studioId && muscular_strain) {
        const weekStart = getWeekStart(new Date());
        await pool.query(
          `UPDATE weekly_goals SET current_load_units = current_load_units + $1
           WHERE studio_id = $2 AND week_start = $3`,
          [Math.round(muscular_strain), studioId, weekStart]
        );

        // Real-time lobby update
        await redis.publish(`studio:${studioId}:update`, JSON.stringify({
          type: 'workout',
          user_id: userId,
          bnco_score: bncoScore,
        }));
      }

      logger.info('WHOOP workout processed', { userId, bncoScore, durationMinutes });
      res.status(200).json({ processed: true, workout_id: workoutResult.rows[0].id });
    } catch (err) {
      next(err);
    }
  });

  return router;
};

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}
