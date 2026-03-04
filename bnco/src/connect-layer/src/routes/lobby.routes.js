const { Router } = require('express');

module.exports = function(pool, redis, logger) {
  const router = Router();

  // Lobby feed data (public, rate-limited)
  router.get('/:slug', async (req, res, next) => {
    try {
      const { slug } = req.params;

      // Get studio
      const studioResult = await pool.query(
        'SELECT id, name, slug, accent_color, logo_url FROM studios WHERE slug = $1',
        [slug]
      );

      if (studioResult.rows.length === 0) {
        return res.status(404).json({ error: 'Studio not found' });
      }

      const studio = studioResult.rows[0];

      // Weekly goal progress
      const goalResult = await pool.query(
        `SELECT * FROM weekly_goals WHERE studio_id = $1
         ORDER BY week_start DESC LIMIT 1`,
        [studio.id]
      );

      const goal = goalResult.rows[0] || null;
      const goalProgress = goal && goal.target_load_units > 0
        ? Math.min(100, Math.round((goal.current_load_units / goal.target_load_units) * 100))
        : 0;

      // Athlete of the week (highest avg bnco score in last 7 days)
      const athleteResult = await pool.query(
        `SELECT u.name, u.avatar_url, ROUND(AVG(ws.bnco_score)) as avg_score,
         COUNT(ws.id) as sessions
         FROM workout_sessions ws
         JOIN users u ON ws.user_id = u.id
         WHERE ws.studio_id = $1 AND ws.recorded_at >= NOW() - INTERVAL '7 days'
         AND ws.bnco_score IS NOT NULL
         GROUP BY u.id, u.name, u.avatar_url
         HAVING COUNT(ws.id) >= 2
         ORDER BY avg_score DESC LIMIT 1`,
        [studio.id]
      );

      const athleteOfTheWeek = athleteResult.rows[0] || null;

      // Top 5 leaderboard (this week)
      const leaderboardResult = await pool.query(
        `SELECT u.name, u.avatar_url, ROUND(AVG(ws.bnco_score)) as avg_score
         FROM workout_sessions ws
         JOIN users u ON ws.user_id = u.id
         JOIN studio_memberships sm ON sm.user_id = u.id AND sm.studio_id = $1 AND sm.status = 'active'
         WHERE ws.studio_id = $1 AND ws.recorded_at >= NOW() - INTERVAL '7 days'
         AND ws.bnco_score IS NOT NULL AND sm.show_on_leaderboard = true
         GROUP BY u.id, u.name, u.avatar_url
         ORDER BY avg_score DESC LIMIT 5`,
        [studio.id]
      );

      // Active challenges
      const challengeResult = await pool.query(
        `SELECT sc.*, 
         cs.name as challenger_name, ds.name as defender_name
         FROM studio_challenges sc
         JOIN studios cs ON sc.challenger_studio_id = cs.id
         JOIN studios ds ON sc.defender_studio_id = ds.id
         WHERE (sc.challenger_studio_id = $1 OR sc.defender_studio_id = $1)
         AND sc.status = 'active'`,
        [studio.id]
      );

      // Recent class highlights (last 3 sessions with highest scores)
      const highlightsResult = await pool.query(
        `SELECT u.name, ws.bnco_score, ws.recorded_at
         FROM workout_sessions ws JOIN users u ON ws.user_id = u.id
         WHERE ws.studio_id = $1 AND ws.bnco_score IS NOT NULL
         AND ws.recorded_at >= NOW() - INTERVAL '48 hours'
         ORDER BY ws.bnco_score DESC LIMIT 3`,
        [studio.id]
      );

      res.json({
        studio: {
          name: studio.name,
          accent_color: studio.accent_color,
          logo_url: studio.logo_url,
        },
        weekly_goal: goal ? {
          target: goal.target_load_units,
          current: goal.current_load_units,
          progress_percent: goalProgress,
        } : null,
        athlete_of_the_week: athleteOfTheWeek,
        leaderboard: leaderboardResult.rows,
        active_challenges: challengeResult.rows,
        recent_highlights: highlightsResult.rows,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  });

  // SSE endpoint for real-time updates
  router.get('/:slug/stream', async (req, res) => {
    const { slug } = req.params;

    const studioResult = await pool.query('SELECT id FROM studios WHERE slug = $1', [slug]);
    if (studioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    const studioId = studioResult.rows[0].id;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // ioredis duplicate() does not auto-connect; explicitly connect before subscribing
    const subscriber = redis.duplicate();
    let subscribed = false;

    try {
      await subscriber.connect();
      await subscriber.subscribe(`studio:${studioId}:update`);
      subscribed = true;
    } catch (err) {
      logger.error('SSE Redis subscriber connection failed', { studioId, error: err.message });
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Stream setup failed' })}\n\n`);
      res.end();
      subscriber.disconnect().catch(() => {});
      return;
    }

    subscriber.on('message', (channel, message) => {
      res.write(`data: ${message}\n\n`);
    });

    subscriber.on('error', (err) => {
      logger.error('SSE Redis subscriber error', { studioId, error: err.message });
    });

    // Heartbeat every 30s
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    req.on('close', () => {
      clearInterval(heartbeat);
      if (subscribed) {
        subscriber.unsubscribe().catch(() => {});
      }
      subscriber.disconnect().catch(() => {});
    });
  });

  return router;
};
