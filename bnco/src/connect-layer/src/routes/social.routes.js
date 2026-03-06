// social.routes.js - Moods, Posts, Friends, Notifications
// Real-time social features for bnco

const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');

module.exports = function (pool, redis, logger) {
  const router = Router();

  // ============================================================
  // MOODS
  // ============================================================

  // Set mood (emoji) for current user, optionally in a studio context
  router.post('/moods', authMiddleware, async (req, res, next) => {
    try {
      const { emoji, studio_id } = req.body;
      if (!emoji || typeof emoji !== 'string' || emoji.length > 10) {
        return res.status(400).json({ error: 'emoji is required (max 10 chars)' });
      }
      const result = await pool.query(
        'INSERT INTO user_moods (user_id, studio_id, emoji) VALUES ($1, $2, $3) RETURNING *',
        [req.userId, studio_id || null, emoji]
      );
      // Publish via Redis for real-time subscribers
      const mood = result.rows[0];
      const user = await pool.query('SELECT name, avatar_url FROM users WHERE id = $1', [req.userId]);
      const payload = { ...mood, user_name: user.rows[0]?.name, avatar_url: user.rows[0]?.avatar_url };
      await redis.publish('bnco:moods', JSON.stringify(payload));
      res.status(201).json({ mood: payload });
    } catch (err) {
      next(err);
    }
  });

  // Get latest moods for a studio
  router.get('/moods/studio/:studioId', authMiddleware, async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT um.*, u.name as user_name, u.avatar_url,
         (SELECT COUNT(*) FROM mood_likes ml WHERE ml.mood_id = um.id) as like_count,
         EXISTS(SELECT 1 FROM mood_likes ml WHERE ml.mood_id = um.id AND ml.liker_id = $2) as liked_by_me
         FROM user_moods um JOIN users u ON um.user_id = u.id
         WHERE um.studio_id = $1
         ORDER BY um.created_at DESC LIMIT 50`,
        [req.params.studioId, req.userId]
      );
      res.json({ moods: result.rows });
    } catch (err) {
      next(err);
    }
  });

  // Get latest mood for a specific user
  router.get('/moods/user/:userId', authMiddleware, async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT um.*, u.name as user_name, u.avatar_url,
         (SELECT COUNT(*) FROM mood_likes ml WHERE ml.mood_id = um.id) as like_count
         FROM user_moods um JOIN users u ON um.user_id = u.id
         WHERE um.user_id = $1 ORDER BY um.created_at DESC LIMIT 1`,
        [req.params.userId]
      );
      res.json({ mood: result.rows[0] || null });
    } catch (err) {
      next(err);
    }
  });

  // Like a mood
  router.post('/moods/:moodId/like', authMiddleware, async (req, res, next) => {
    try {
      const mood = await pool.query('SELECT * FROM user_moods WHERE id = $1', [req.params.moodId]);
      if (mood.rows.length === 0) return res.status(404).json({ error: 'Mood not found' });

      await pool.query(
        'INSERT INTO mood_likes (mood_id, liker_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.params.moodId, req.userId]
      );

      // Create notification for mood owner (if not self-like)
      if (mood.rows[0].user_id !== req.userId) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, actor_id, target_id, target_type)
           VALUES ($1, 'mood_like', $2, $3, 'mood')`,
          [mood.rows[0].user_id, req.userId, req.params.moodId]
        );
        // Publish notification
        const actor = await pool.query('SELECT name FROM users WHERE id = $1', [req.userId]);
        await redis.publish('bnco:notifications:' + mood.rows[0].user_id, JSON.stringify({
          type: 'mood_like',
          actor_name: actor.rows[0]?.name,
          target_id: req.params.moodId,
          created_at: new Date().toISOString(),
        }));
      }

      const count = await pool.query('SELECT COUNT(*) FROM mood_likes WHERE mood_id = $1', [req.params.moodId]);
      res.json({ liked: true, like_count: parseInt(count.rows[0].count) });
    } catch (err) {
      next(err);
    }
  });

  // Unlike a mood
  router.delete('/moods/:moodId/like', authMiddleware, async (req, res, next) => {
    try {
      await pool.query('DELETE FROM mood_likes WHERE mood_id = $1 AND liker_id = $2', [req.params.moodId, req.userId]);
      const count = await pool.query('SELECT COUNT(*) FROM mood_likes WHERE mood_id = $1', [req.params.moodId]);
      res.json({ liked: false, like_count: parseInt(count.rows[0].count) });
    } catch (err) {
      next(err);
    }
  });

  // ============================================================
  // POSTS
  // ============================================================

  // Create a post (image URL + caption + optional studio tag)
  router.post('/posts', authMiddleware, async (req, res, next) => {
    try {
      const { image_url, caption, studio_id, city, state, lat, lng } = req.body;
      if (!image_url) return res.status(400).json({ error: 'image_url is required' });
      if (caption && caption.length > 2000) return res.status(400).json({ error: 'Caption too long (max 2000 chars)' });

      // Check if user account is private - posts from private accounts only visible to friends
      const result = await pool.query(
        `INSERT INTO posts (author_id, studio_id, image_url, caption, city, state, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [req.userId, studio_id || null, image_url, caption || null, city || null, state || null, lat || null, lng || null]
      );

      const post = result.rows[0];
      const author = await pool.query('SELECT name, avatar_url FROM users WHERE id = $1', [req.userId]);
      const payload = { ...post, author_name: author.rows[0]?.name, avatar_url: author.rows[0]?.avatar_url, like_count: 0, comment_count: 0, liked_by_me: false };

      await redis.publish('bnco:posts', JSON.stringify(payload));
      res.status(201).json({ post: payload });
    } catch (err) {
      next(err);
    }
  });

  // Get explore feed: "following", "near_me", "for_you"
  router.get('/posts/feed/:tab', authMiddleware, async (req, res, next) => {
    try {
      const { tab } = req.params;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const offset = parseInt(req.query.offset) || 0;
      const { lat, lng } = req.query;

      let query;
      let params;

      if (tab === 'following') {
        // Posts from friends only
        query = `SELECT p.*, u.name as author_name, u.avatar_url, u.is_private,
          s.name as studio_name,
          (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
          (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) as comment_count,
          EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.liker_id = $1) as liked_by_me
          FROM posts p
          JOIN users u ON p.author_id = u.id
          LEFT JOIN studios s ON p.studio_id = s.id
          WHERE p.author_id IN (
            SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END
            FROM friendships WHERE (requester_id = $1 OR addressee_id = $1) AND status = 'accepted'
          ) OR p.author_id = $1
          ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`;
        params = [req.userId, limit, offset];
      } else if (tab === 'near_me' && lat && lng) {
        // Posts near the user's location (within ~50km)
        query = `SELECT p.*, u.name as author_name, u.avatar_url, u.is_private,
          s.name as studio_name,
          (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
          (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) as comment_count,
          EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.liker_id = $1) as liked_by_me
          FROM posts p
          JOIN users u ON p.author_id = u.id
          LEFT JOIN studios s ON p.studio_id = s.id
          WHERE p.lat IS NOT NULL AND p.lng IS NOT NULL
            AND ABS(p.lat - $4) < 0.45 AND ABS(p.lng - $5) < 0.55
            AND (u.is_private = false OR p.author_id = $1 OR p.author_id IN (
              SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END
              FROM friendships WHERE (requester_id = $1 OR addressee_id = $1) AND status = 'accepted'
            ))
          ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`;
        params = [req.userId, limit, offset, parseFloat(lat), parseFloat(lng)];
      } else {
        // For you page - all public posts + friends' posts (excluding blocked)
        query = `SELECT p.*, u.name as author_name, u.avatar_url, u.is_private,
          s.name as studio_name,
          (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
          (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) as comment_count,
          EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.liker_id = $1) as liked_by_me
          FROM posts p
          JOIN users u ON p.author_id = u.id
          LEFT JOIN studios s ON p.studio_id = s.id
          WHERE (u.is_private = false OR p.author_id = $1 OR p.author_id IN (
            SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END
            FROM friendships WHERE (requester_id = $1 OR addressee_id = $1) AND status = 'accepted'
          ))
          AND p.author_id NOT IN (
            SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END
            FROM friendships WHERE (requester_id = $1 OR addressee_id = $1) AND status = 'blocked'
          )
          ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`;
        params = [req.userId, limit, offset];
      }

      const result = await pool.query(query, params);
      res.json({ posts: result.rows, has_more: result.rows.length === limit });
    } catch (err) {
      next(err);
    }
  });

  // Get a single post with comments
  router.get('/posts/:postId', authMiddleware, async (req, res, next) => {
    try {
      const post = await pool.query(
        `SELECT p.*, u.name as author_name, u.avatar_url, u.is_private,
         s.name as studio_name,
         (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
         (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) as comment_count,
         EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.liker_id = $2) as liked_by_me
         FROM posts p JOIN users u ON p.author_id = u.id
         LEFT JOIN studios s ON p.studio_id = s.id
         WHERE p.id = $1`,
        [req.params.postId, req.userId]
      );
      if (post.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

      const comments = await pool.query(
        `SELECT pc.*, u.name as author_name, u.avatar_url
         FROM post_comments pc JOIN users u ON pc.author_id = u.id
         WHERE pc.post_id = $1 ORDER BY pc.created_at ASC LIMIT 100`,
        [req.params.postId]
      );

      res.json({ post: post.rows[0], comments: comments.rows });
    } catch (err) {
      next(err);
    }
  });

  // Like a post
  router.post('/posts/:postId/like', authMiddleware, async (req, res, next) => {
    try {
      const post = await pool.query('SELECT author_id FROM posts WHERE id = $1', [req.params.postId]);
      if (post.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

      await pool.query(
        'INSERT INTO post_likes (post_id, liker_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.params.postId, req.userId]
      );

      if (post.rows[0].author_id !== req.userId) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, actor_id, target_id, target_type)
           VALUES ($1, 'post_like', $2, $3, 'post')`,
          [post.rows[0].author_id, req.userId, req.params.postId]
        );
        const actor = await pool.query('SELECT name FROM users WHERE id = $1', [req.userId]);
        await redis.publish('bnco:notifications:' + post.rows[0].author_id, JSON.stringify({
          type: 'post_like',
          actor_name: actor.rows[0]?.name,
          target_id: req.params.postId,
          created_at: new Date().toISOString(),
        }));
      }

      const count = await pool.query('SELECT COUNT(*) FROM post_likes WHERE post_id = $1', [req.params.postId]);
      res.json({ liked: true, like_count: parseInt(count.rows[0].count) });
    } catch (err) {
      next(err);
    }
  });

  // Unlike a post
  router.delete('/posts/:postId/like', authMiddleware, async (req, res, next) => {
    try {
      await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND liker_id = $2', [req.params.postId, req.userId]);
      const count = await pool.query('SELECT COUNT(*) FROM post_likes WHERE post_id = $1', [req.params.postId]);
      res.json({ liked: false, like_count: parseInt(count.rows[0].count) });
    } catch (err) {
      next(err);
    }
  });

  // Comment on a post
  router.post('/posts/:postId/comments', authMiddleware, async (req, res, next) => {
    try {
      const { body } = req.body;
      if (!body || typeof body !== 'string' || body.length > 1000) {
        return res.status(400).json({ error: 'Comment body required (max 1000 chars)' });
      }

      const post = await pool.query('SELECT author_id FROM posts WHERE id = $1', [req.params.postId]);
      if (post.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

      const result = await pool.query(
        'INSERT INTO post_comments (post_id, author_id, body) VALUES ($1, $2, $3) RETURNING *',
        [req.params.postId, req.userId, body.trim()]
      );

      const author = await pool.query('SELECT name, avatar_url FROM users WHERE id = $1', [req.userId]);
      const comment = { ...result.rows[0], author_name: author.rows[0]?.name, avatar_url: author.rows[0]?.avatar_url };

      if (post.rows[0].author_id !== req.userId) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, actor_id, target_id, target_type)
           VALUES ($1, 'post_comment', $2, $3, 'post')`,
          [post.rows[0].author_id, req.userId, req.params.postId]
        );
        await redis.publish('bnco:notifications:' + post.rows[0].author_id, JSON.stringify({
          type: 'post_comment',
          actor_name: author.rows[0]?.name,
          target_id: req.params.postId,
          body: body.trim().substring(0, 100),
          created_at: new Date().toISOString(),
        }));
      }

      await redis.publish('bnco:comments:' + req.params.postId, JSON.stringify(comment));
      res.status(201).json({ comment });
    } catch (err) {
      next(err);
    }
  });

  // Delete own post
  router.delete('/posts/:postId', authMiddleware, async (req, res, next) => {
    try {
      const result = await pool.query('DELETE FROM posts WHERE id = $1 AND author_id = $2 RETURNING id', [req.params.postId, req.userId]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found or not yours' });
      res.json({ deleted: true });
    } catch (err) {
      next(err);
    }
  });

  // ============================================================
  // FRIENDS
  // ============================================================

  // Send friend request
  router.post('/friends/request', authMiddleware, async (req, res, next) => {
    try {
      const { user_id } = req.body;
      if (!user_id) return res.status(400).json({ error: 'user_id is required' });
      if (user_id === req.userId) return res.status(400).json({ error: 'Cannot friend yourself' });

      // Check if friendship already exists in either direction
      const existing = await pool.query(
        `SELECT * FROM friendships
         WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)`,
        [req.userId, user_id]
      );

      if (existing.rows.length > 0) {
        const f = existing.rows[0];
        if (f.status === 'accepted') return res.status(400).json({ error: 'Already friends' });
        if (f.status === 'pending' && f.requester_id === req.userId) return res.status(400).json({ error: 'Request already sent' });
        if (f.status === 'pending' && f.addressee_id === req.userId) {
          // They sent us a request, auto-accept
          await pool.query("UPDATE friendships SET status = 'accepted', updated_at = NOW() WHERE id = $1", [f.id]);
          await pool.query(
            `INSERT INTO notifications (user_id, type, actor_id, target_id, target_type)
             VALUES ($1, 'friend_accepted', $2, $3, 'friendship')`,
            [f.requester_id, req.userId, f.id]
          );
          const actor = await pool.query('SELECT name FROM users WHERE id = $1', [req.userId]);
          await redis.publish('bnco:notifications:' + f.requester_id, JSON.stringify({
            type: 'friend_accepted',
            actor_name: actor.rows[0]?.name,
            created_at: new Date().toISOString(),
          }));
          return res.json({ status: 'accepted' });
        }
        if (f.status === 'blocked') return res.status(403).json({ error: 'Unable to send request' });
      }

      const result = await pool.query(
        "INSERT INTO friendships (requester_id, addressee_id, status) VALUES ($1, $2, 'pending') RETURNING *",
        [req.userId, user_id]
      );

      // Notification
      await pool.query(
        `INSERT INTO notifications (user_id, type, actor_id, target_id, target_type)
         VALUES ($1, 'friend_request', $2, $3, 'friendship')`,
        [user_id, req.userId, result.rows[0].id]
      );
      const actor = await pool.query('SELECT name FROM users WHERE id = $1', [req.userId]);
      await redis.publish('bnco:notifications:' + user_id, JSON.stringify({
        type: 'friend_request',
        actor_name: actor.rows[0]?.name,
        created_at: new Date().toISOString(),
      }));

      res.status(201).json({ friendship: result.rows[0] });
    } catch (err) {
      if (err.code === '23505') return res.status(400).json({ error: 'Request already exists' });
      next(err);
    }
  });

  // Accept/reject/block friend request
  router.patch('/friends/:friendshipId', authMiddleware, async (req, res, next) => {
    try {
      const { action } = req.body; // 'accept', 'reject', 'block'
      if (!['accept', 'reject', 'block'].includes(action)) {
        return res.status(400).json({ error: 'action must be accept, reject, or block' });
      }

      const f = await pool.query('SELECT * FROM friendships WHERE id = $1', [req.params.friendshipId]);
      if (f.rows.length === 0) return res.status(404).json({ error: 'Friendship not found' });
      if (f.rows[0].addressee_id !== req.userId && action !== 'block') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      if (action === 'reject') {
        await pool.query('DELETE FROM friendships WHERE id = $1', [req.params.friendshipId]);
        return res.json({ deleted: true });
      }

      const newStatus = action === 'accept' ? 'accepted' : 'blocked';
      await pool.query('UPDATE friendships SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, req.params.friendshipId]);

      if (action === 'accept') {
        await pool.query(
          `INSERT INTO notifications (user_id, type, actor_id, target_id, target_type)
           VALUES ($1, 'friend_accepted', $2, $3, 'friendship')`,
          [f.rows[0].requester_id, req.userId, req.params.friendshipId]
        );
        const actor = await pool.query('SELECT name FROM users WHERE id = $1', [req.userId]);
        await redis.publish('bnco:notifications:' + f.rows[0].requester_id, JSON.stringify({
          type: 'friend_accepted',
          actor_name: actor.rows[0]?.name,
          created_at: new Date().toISOString(),
        }));
      }

      res.json({ status: newStatus });
    } catch (err) {
      next(err);
    }
  });

  // Remove friend
  router.delete('/friends/:friendshipId', authMiddleware, async (req, res, next) => {
    try {
      const result = await pool.query(
        'DELETE FROM friendships WHERE id = $1 AND (requester_id = $2 OR addressee_id = $2) RETURNING id',
        [req.params.friendshipId, req.userId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ deleted: true });
    } catch (err) {
      next(err);
    }
  });

  // Get my friends list
  router.get('/friends', authMiddleware, async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT f.id as friendship_id, f.status, f.created_at,
         u.id, u.name, u.avatar_url, u.is_private,
         CASE WHEN f.requester_id = $1 THEN 'sent' ELSE 'received' END as direction
         FROM friendships f
         JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
         WHERE (f.requester_id = $1 OR f.addressee_id = $1) AND f.status IN ('accepted', 'pending')
         ORDER BY f.status, u.name`,
        [req.userId]
      );
      res.json({
        friends: result.rows.filter(r => r.status === 'accepted'),
        pending: result.rows.filter(r => r.status === 'pending'),
      });
    } catch (err) {
      next(err);
    }
  });

  // Get another user's friends list (public)
  router.get('/friends/user/:userId', authMiddleware, async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT u.id, u.name, u.avatar_url, u.is_private
         FROM friendships f
         JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
         WHERE (f.requester_id = $1 OR f.addressee_id = $1) AND f.status = 'accepted'
         ORDER BY u.name`,
        [req.params.userId]
      );
      res.json({ friends: result.rows });
    } catch (err) {
      next(err);
    }
  });

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  // Get notifications
  router.get('/notifications', authMiddleware, async (req, res, next) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 30, 100);
      const result = await pool.query(
        `SELECT n.*, u.name as actor_name, u.avatar_url as actor_avatar
         FROM notifications n JOIN users u ON n.actor_id = u.id
         WHERE n.user_id = $1 ORDER BY n.created_at DESC LIMIT $2`,
        [req.userId, limit]
      );
      const unread = await pool.query(
        'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
        [req.userId]
      );
      res.json({ notifications: result.rows, unread_count: parseInt(unread.rows[0].count) });
    } catch (err) {
      next(err);
    }
  });

  // Mark notifications as read
  router.patch('/notifications/read', authMiddleware, async (req, res, next) => {
    try {
      const { ids } = req.body; // array of notification ids, or empty for all
      if (ids && Array.isArray(ids) && ids.length > 0) {
        await pool.query('UPDATE notifications SET read = true WHERE id = ANY($1) AND user_id = $2', [ids, req.userId]);
      } else {
        await pool.query('UPDATE notifications SET read = true WHERE user_id = $1', [req.userId]);
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // ============================================================
  // REAL-TIME POLLING (SSE)
  // ============================================================

  // Server-Sent Events for real-time updates
  router.get('/stream', authMiddleware, async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write('data: {"type":"connected"}\n\n');

    const subscriber = redis.duplicate();
    const channels = [
      'bnco:moods',
      'bnco:posts',
      'bnco:notifications:' + req.userId,
    ];

    // If in a studio, subscribe to studio-specific channels
    const studioId = req.query.studio_id;
    if (studioId) {
      channels.push('bnco:comments:' + studioId);
    }

    await subscriber.subscribe(...channels);

    subscriber.on('message', (channel, message) => {
      const eventType = channel.startsWith('bnco:notifications:') ? 'notification'
        : channel.startsWith('bnco:comments:') ? 'comment'
        : channel === 'bnco:moods' ? 'mood'
        : channel === 'bnco:posts' ? 'post'
        : 'unknown';
      res.write(`event: ${eventType}\ndata: ${message}\n\n`);
    });

    // Heartbeat every 30s
    const heartbeat = setInterval(() => {
      res.write(':heartbeat\n\n');
    }, 30000);

    req.on('close', () => {
      clearInterval(heartbeat);
      subscriber.unsubscribe();
      subscriber.disconnect();
    });
  });

  // ============================================================
  // USER SEARCH (for friend requests)
  // ============================================================

  router.get('/users/search', authMiddleware, async (req, res, next) => {
    try {
      const q = req.query.q;
      if (!q || q.length < 2) return res.status(400).json({ error: 'Query too short (min 2 chars)' });

      const result = await pool.query(
        `SELECT id, name, avatar_url, is_private FROM users
         WHERE id != $1 AND (LOWER(name) LIKE $2 OR LOWER(email) LIKE $2)
         ORDER BY name LIMIT 20`,
        [req.userId, '%' + q.toLowerCase() + '%']
      );
      res.json({ users: result.rows });
    } catch (err) {
      next(err);
    }
  });

  // ============================================================
  // USER PROFILE (public view)
  // ============================================================

  router.get('/users/:userId/profile', authMiddleware, async (req, res, next) => {
    try {
      const user = await pool.query(
        'SELECT id, name, avatar_url, bio, is_private, created_at FROM users WHERE id = $1',
        [req.params.userId]
      );
      if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

      const friendCount = await pool.query(
        "SELECT COUNT(*) FROM friendships WHERE (requester_id = $1 OR addressee_id = $1) AND status = 'accepted'",
        [req.params.userId]
      );

      const postCount = await pool.query('SELECT COUNT(*) FROM posts WHERE author_id = $1', [req.params.userId]);

      // Check friendship status with requesting user
      const friendship = await pool.query(
        `SELECT id, status, requester_id FROM friendships
         WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)`,
        [req.userId, req.params.userId]
      );

      const profile = user.rows[0];
      profile.friend_count = parseInt(friendCount.rows[0].count);
      profile.post_count = parseInt(postCount.rows[0].count);
      profile.friendship = friendship.rows[0] || null;
      profile.is_me = req.params.userId === req.userId;

      res.json({ profile });
    } catch (err) {
      next(err);
    }
  });

  // Update privacy
  router.patch('/users/privacy', authMiddleware, async (req, res, next) => {
    try {
      const { is_private } = req.body;
      await pool.query('UPDATE users SET is_private = $1 WHERE id = $2', [!!is_private, req.userId]);
      res.json({ is_private: !!is_private });
    } catch (err) {
      next(err);
    }
  });

  // Upload image (base64 -> stored as data URI for now, swap to S3/R2 later)
  router.post('/upload', authMiddleware, async (req, res, next) => {
    try {
      const { image } = req.body; // base64 data URI
      if (!image || !image.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Valid base64 image data URI required' });
      }
      // For now, just echo it back. In production, upload to S3/R2 and return URL.
      // Max size check (roughly 5MB in base64)
      if (image.length > 7_000_000) {
        return res.status(400).json({ error: 'Image too large (max ~5MB)' });
      }
      res.json({ url: image });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
