const { Router } = require('express');
const Joi = require('joi');
const { authMiddleware } = require('../middleware/auth');

module.exports = function(pool, redis, logger) {
  const router = Router();

  // Complete onboarding - accepts both athlete and studio_admin payloads
  router.post('/complete', authMiddleware, async (req, res, next) => {
    try {
      const { role } = req.body;

      if (role === 'studio_admin') {
        // Studio owner onboarding
        const { studio_name, studio_location, studio_types, leaderboard_public, leaderboard_anonymous } = req.body;

        // Save onboarding completion
        await pool.query(
          `INSERT INTO user_onboarding (user_id, pilates_frequency, completed_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (user_id) DO UPDATE SET
             pilates_frequency = $2, completed_at = NOW()`,
          [req.userId, 'studio_owner']
        );

        // Update user role
        await pool.query(
          "UPDATE users SET role = 'studio_admin', updated_at = NOW() WHERE id = $1",
          [req.userId]
        );

        // Create studio if name provided
        if (studio_name) {
          const slug = studio_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

          // Check slug uniqueness, append random suffix if needed
          let finalSlug = slug;
          const existing = await pool.query('SELECT id FROM studios WHERE slug = $1', [slug]);
          if (existing.rows.length > 0) {
            finalSlug = slug + '-' + Math.random().toString(36).substring(2, 6);
          }

          const studioResult = await pool.query(
            `INSERT INTO studios (name, slug, city, state, owner_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [studio_name, finalSlug, studio_location || null, null, req.userId]
          );

          const studioId = studioResult.rows[0].id;

          // Generate join code
          const joinCode = generateJoinCode();
          await pool.query('UPDATE studios SET join_code = $1 WHERE id = $2', [joinCode, studioId]);

          // Auto-join owner as active member
          await pool.query(
            `INSERT INTO studio_memberships (studio_id, user_id, status, verified_via, approved_at)
             VALUES ($1, $2, 'active', 'owner', NOW())
             ON CONFLICT DO NOTHING`,
            [studioId, req.userId]
          );

          logger.info('Studio created via onboarding', { userId: req.userId, studioId, name: studio_name });
          return res.json({ completed: true, studio_id: studioId, join_code: joinCode });
        }

        logger.info('Studio owner onboarding completed', { userId: req.userId });
        return res.json({ completed: true });

      } else {
        // Athlete onboarding
        const { frequency, devices, studio_id, birthday, gender } = req.body;

        const pilatesFrequency = frequency || 'not_specified';

        // Save onboarding data
        await pool.query(
          `INSERT INTO user_onboarding (user_id, pilates_frequency, completed_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (user_id) DO UPDATE SET
             pilates_frequency = $2, completed_at = NOW()`,
          [req.userId, pilatesFrequency]
        );

        // Update user role
        await pool.query(
          "UPDATE users SET role = 'athlete', updated_at = NOW() WHERE id = $1",
          [req.userId]
        );

        // Request studio membership if studio selected
        if (studio_id) {
          const studio = await pool.query('SELECT id FROM studios WHERE id = $1', [studio_id]);
          if (studio.rows.length > 0) {
            const existingMembership = await pool.query(
              'SELECT id FROM studio_memberships WHERE studio_id = $1 AND user_id = $2',
              [studio_id, req.userId]
            );
            if (existingMembership.rows.length === 0) {
              await pool.query(
                `INSERT INTO studio_memberships (studio_id, user_id, status, requested_at)
                 VALUES ($1, $2, 'pending', NOW())`,
                [studio_id, req.userId]
              );
            }
          }
        }

        logger.info('Athlete onboarding completed', { userId: req.userId, frequency: pilatesFrequency });
        return res.json({ completed: true, studios_requested: studio_id ? 1 : 0 });
      }
    } catch (err) {
      next(err);
    }
  });

  // Search studios (for the "Which studio do you go to?" question)
  router.get('/studios/search', authMiddleware, async (req, res, next) => {
    try {
      const query = req.query.q || '';
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);

      const result = await pool.query(
        `SELECT id, name, slug, city, state, logo_url,
         (SELECT COUNT(*) FROM studio_memberships WHERE studio_id = studios.id AND status = 'active') as member_count
         FROM studios
         WHERE name ILIKE $1 OR city ILIKE $1
         ORDER BY name LIMIT $2`,
        [`%${query}%`, limit]
      );

      res.json({ studios: result.rows });
    } catch (err) {
      next(err);
    }
  });

  // Get onboarding status
  router.get('/status', authMiddleware, async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT uo.*, 
         (SELECT json_agg(json_build_object(
           'studio_id', sm.studio_id, 
           'status', sm.status,
           'studio_name', s.name
         ))
         FROM studio_memberships sm 
         JOIN studios s ON sm.studio_id = s.id
         WHERE sm.user_id = $1) as studio_memberships
         FROM user_onboarding uo WHERE uo.user_id = $1`,
        [req.userId]
      );

      if (result.rows.length === 0) {
        return res.json({ completed: false, data: null });
      }

      const onboarding = result.rows[0];
      res.json({
        completed: !!onboarding.completed_at,
        data: onboarding,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
};

// Check if athlete is a paying member at the studio via billing integration
async function attemptBillingVerification(pool, studioId, userId) {
  try {
    // Check if studio has billing integration
    const integration = await pool.query(
      'SELECT * FROM studio_billing_integrations WHERE studio_id = $1 AND active = true',
      [studioId]
    );

    if (integration.rows.length === 0) return false;

    const billing = integration.rows[0];

    // Get user email for lookup
    const user = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) return false;

    const userEmail = user.rows[0].email;

    // Check billing provider for active membership
    switch (billing.provider) {
      case 'stripe':
        return await checkStripeCustomer(billing, userEmail);
      case 'mindbody':
        return await checkMindBodyMember(billing, userEmail);
      case 'mariana_tek':
        return await checkMarianaTekMember(billing, userEmail);
      default:
        return false;
    }
  } catch (err) {
    // Billing check failure should not block signup - just route to manual
    return false;
  }
}

// Billing provider checks (stubs - implement with actual APIs)
async function checkStripeCustomer(billing, email) {
  // Query Stripe for active subscriptions matching this email
  // const stripe = require('stripe')(decrypt(billing.api_key_encrypted));
  // const customers = await stripe.customers.list({ email, limit: 1 });
  // if (customers.data.length === 0) return false;
  // const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: 'active' });
  // return subs.data.length > 0;
  return false; // stub
}

async function checkMindBodyMember(billing, email) {
  // Query MindBody API for active client with this email
  return false; // stub
}

async function checkMarianaTekMember(billing, email) {
  // Query Mariana Tek API for active member with this email
  return false; // stub
}

function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
