const { Router } = require('express');
const Joi = require('joi');
const { authMiddleware } = require('../middleware/auth');

module.exports = function(pool, redis, logger) {
  const router = Router();

  const onboardingSchema = Joi.object({
    pilates_frequency: Joi.string().max(50).required(), // "3 days a week", "daily", etc.
    studio_ids: Joi.array().items(Joi.string().uuid()).default([]), // selected studios
    device_preferences: Joi.object({
      whoop: Joi.boolean().default(false),
      apple_watch: Joi.boolean().default(false),
    }).default({ whoop: false, apple_watch: false }),
  });

  // Complete athlete onboarding
  router.post('/complete', authMiddleware, async (req, res, next) => {
    try {
      const { error, value } = onboardingSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const { pilates_frequency, studio_ids, device_preferences } = value;

      // Save onboarding data
      await pool.query(
        `INSERT INTO user_onboarding (user_id, pilates_frequency, completed_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           pilates_frequency = $2, completed_at = NOW()`,
        [req.userId, pilates_frequency]
      );

      // Request studio memberships (pending approval)
      for (const studioId of studio_ids) {
        // Verify studio exists
        const studio = await pool.query('SELECT id FROM studios WHERE id = $1', [studioId]);
        if (studio.rows.length === 0) continue;

        // Check if membership already exists
        const existing = await pool.query(
          'SELECT id FROM studio_memberships WHERE studio_id = $1 AND user_id = $2',
          [studioId, req.userId]
        );
        if (existing.rows.length > 0) continue;

        // Try billing auto-verification first
        const autoApproved = await attemptBillingVerification(pool, studioId, req.userId);

        await pool.query(
          `INSERT INTO studio_memberships (studio_id, user_id, status, verified_via, approved_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            studioId,
            req.userId,
            autoApproved ? 'active' : 'pending',
            autoApproved ? 'billing_auto' : null,
            autoApproved ? new Date() : null,
          ]
        );

        // Notify studio admin of pending request (if not auto-approved)
        if (!autoApproved) {
          await redis.publish(`studio:${studioId}:membership`, JSON.stringify({
            type: 'membership_request',
            user_id: req.userId,
          }));
        }
      }

      logger.info('Onboarding completed', { userId: req.userId, studios: studio_ids.length });
      res.json({ completed: true, studios_requested: studio_ids.length });
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
