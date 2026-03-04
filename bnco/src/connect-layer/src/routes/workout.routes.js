const { Router } = require('express');
const Joi = require('joi');
const { authMiddleware } = require('../middleware/auth');
const {
  calculateControlScore,
  calculateStillnessScore,
  calculateRespiratoryScore,
  calculateBncoScore,
} = require('../services/scoring.service');

module.exports = function(pool, redis, logger) {
  const router = Router();

  const workoutSchema = Joi.object({
    studio_id: Joi.string().uuid().allow(null),
    recorded_at: Joi.date().iso().required(),
    duration_minutes: Joi.number().integer().min(1).max(300).required(),
    source: Joi.string().valid('whoop', 'apple_watch', 'both').required(),
    raw_muscular_load: Joi.number().min(0).allow(null),
    raw_stability_variance: Joi.number().min(0).max(2).allow(null),
    raw_respiratory_rate: Joi.number().min(0).max(60).allow(null),
    raw_hrv: Joi.number().min(0).allow(null),
  });

  // Submit workout
  router.post('/', authMiddleware, async (req, res, next) => {
    try {
      const { error, value } = workoutSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const {
        studio_id, recorded_at, duration_minutes, source,
        raw_muscular_load, raw_stability_variance, raw_respiratory_rate, raw_hrv,
      } = value;

      // Calculate scores
      const controlScore = calculateControlScore(raw_muscular_load, duration_minutes);
      const stillnessScore = calculateStillnessScore(raw_stability_variance);
      const respiratoryScore = calculateRespiratoryScore(raw_respiratory_rate);
      const bncoScore = calculateBncoScore(controlScore, stillnessScore, respiratoryScore);

      const result = await pool.query(
        `INSERT INTO workout_sessions 
         (user_id, studio_id, recorded_at, duration_minutes, source,
          raw_muscular_load, raw_stability_variance, raw_respiratory_rate, raw_hrv,
          control_score, stillness_score, respiratory_score, bnco_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [req.userId, studio_id, recorded_at, duration_minutes, source,
         raw_muscular_load, raw_stability_variance, raw_respiratory_rate, raw_hrv,
         controlScore, stillnessScore, respiratoryScore, bncoScore]
      );

      const workout = result.rows[0];

      // Update studio weekly goal if applicable
      if (studio_id && raw_muscular_load) {
        const weekStart = getWeekStart(new Date(recorded_at));
        await pool.query(
          `UPDATE weekly_goals SET current_load_units = current_load_units + $1
           WHERE studio_id = $2 AND week_start = $3`,
          [Math.round(raw_muscular_load), studio_id, weekStart]
        );

        // Publish real-time update
        await redis.publish(`studio:${studio_id}:update`, JSON.stringify({
          type: 'workout',
          workout: { user_id: req.userId, bnco_score: bncoScore },
        }));
      }

      logger.info('Workout submitted', { userId: req.userId, bncoScore, source });
      res.status(201).json(workout);
    } catch (err) {
      next(err);
    }
  });

  // Get my workouts
  router.get('/me', authMiddleware, async (req, res, next) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const offset = parseInt(req.query.offset) || 0;

      const result = await pool.query(
        `SELECT * FROM workout_sessions WHERE user_id = $1
         ORDER BY recorded_at DESC LIMIT $2 OFFSET $3`,
        [req.userId, limit, offset]
      );

      res.json({ workouts: result.rows, limit, offset });
    } catch (err) {
      next(err);
    }
  });

  // Get my stats
  router.get('/me/stats', authMiddleware, async (req, res, next) => {
    try {
      const period = req.query.period || 'month'; // week, month, all
      let dateFilter = '';

      if (period === 'week') {
        dateFilter = "AND recorded_at >= NOW() - INTERVAL '7 days'";
      } else if (period === 'month') {
        dateFilter = "AND recorded_at >= NOW() - INTERVAL '30 days'";
      }

      const result = await pool.query(
        `SELECT 
           COUNT(*) as total_workouts,
           ROUND(AVG(bnco_score)) as avg_bnco_score,
           ROUND(AVG(control_score)) as avg_control,
           ROUND(AVG(stillness_score)) as avg_stillness,
           ROUND(AVG(respiratory_score)) as avg_respiratory,
           MAX(bnco_score) as peak_bnco_score,
           SUM(duration_minutes) as total_minutes
         FROM workout_sessions 
         WHERE user_id = $1 ${dateFilter}`,
        [req.userId]
      );

      // Recent trend (last 10 sessions)
      const trend = await pool.query(
        `SELECT recorded_at, bnco_score FROM workout_sessions
         WHERE user_id = $1 AND bnco_score IS NOT NULL
         ORDER BY recorded_at DESC LIMIT 10`,
        [req.userId]
      );

      res.json({
        stats: result.rows[0],
        trend: trend.rows.reverse(),
        period,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
};

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}
