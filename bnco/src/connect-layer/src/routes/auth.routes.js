const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('joi');
const { OAuth2Client } = require('google-auth-library');

module.exports = function(pool, logger) {
  const router = Router();

  const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    name: Joi.string().min(1).max(100).required(),
    role: Joi.string().valid('athlete', 'studio_admin').default('athlete'),
  });

  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const googleAuthSchema = Joi.object({
    google_token: Joi.string().required(),
    role: Joi.string().valid('athlete', 'studio_admin').default('athlete'),
  });

  // Register (email/password)
  router.post('/register', async (req, res, next) => {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const { email, password, name, role } = value;

      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, auth_provider)
         VALUES ($1, $2, $3, $4, 'email')
         RETURNING id, email, name, role, created_at`,
        [email, passwordHash, name, role]
      );

      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      });

      logger.info('User registered (email)', { userId: user.id, role: user.role });
      res.status(201).json({ user, token, needs_onboarding: true });
    } catch (err) {
      next(err);
    }
  });

  // Google OAuth sign-in/sign-up
  router.post('/google', async (req, res, next) => {
    try {
      const { error, value } = googleAuthSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const { google_token, role } = value;

      // Verify Google token (in production, use googleapis or firebase-admin)
      // For now, decode the JWT payload (Google ID tokens are JWTs)
      const googlePayload = await verifyGoogleToken(google_token);
      if (!googlePayload) {
        return res.status(401).json({ error: 'Invalid Google token' });
      }

      const { sub: googleId, email, name, picture } = googlePayload;

      // Check if user exists by google_id or email
      let userResult = await pool.query(
        'SELECT id, email, name, role FROM users WHERE google_id = $1 OR email = $2',
        [googleId, email]
      );

      let user;
      let needsOnboarding = false;

      if (userResult.rows.length > 0) {
        // Existing user - update google_id if missing
        user = userResult.rows[0];
        await pool.query(
          'UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2), updated_at = NOW() WHERE id = $3',
          [googleId, picture, user.id]
        );
      } else {
        // New user - create account
        const result = await pool.query(
          `INSERT INTO users (email, name, avatar_url, role, google_id, auth_provider)
           VALUES ($1, $2, $3, $4, $5, 'google')
           RETURNING id, email, name, role, created_at`,
          [email, name, picture, role, googleId]
        );
        user = result.rows[0];
        needsOnboarding = true;
        logger.info('User registered (google)', { userId: user.id });
      }

      // Check if onboarding is complete
      const onboarding = await pool.query(
        'SELECT completed_at FROM user_onboarding WHERE user_id = $1',
        [user.id]
      );
      if (onboarding.rows.length === 0 || !onboarding.rows[0].completed_at) {
        needsOnboarding = true;
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      });

      res.json({ user, token, needs_onboarding: needsOnboarding });
    } catch (err) {
      next(err);
    }
  });

  // Login (email/password)
  router.post('/login', async (req, res, next) => {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const { email, password } = value;

      const result = await pool.query(
        'SELECT id, email, name, role, password_hash, auth_provider FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result.rows[0];

      // Google-only users can't login with password
      if (user.auth_provider === 'google' && !user.password_hash) {
        return res.status(401).json({ error: 'This account uses Google sign-in' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check onboarding
      const onboarding = await pool.query(
        'SELECT completed_at FROM user_onboarding WHERE user_id = $1',
        [user.id]
      );
      const needsOnboarding = onboarding.rows.length === 0 || !onboarding.rows[0].completed_at;

      delete user.password_hash;
      delete user.auth_provider;

      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      });

      logger.info('User logged in', { userId: user.id });
      res.json({ user, token, needs_onboarding: needsOnboarding });
    } catch (err) {
      next(err);
    }
  });

  // Refresh token
  router.post('/refresh', async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const oldToken = authHeader.split(' ')[1];

      let decoded;
      try {
        decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
      } catch (jwtErr) {
        // Token is expired or invalid - user must re-authenticate
        return res.status(401).json({ error: 'Token expired. Please sign in again.' });
      }

      const result = await pool.query('SELECT id, role FROM users WHERE id = $1', [decoded.userId]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      res.json({ token });
    } catch (err) {
      next(err);
    }
  });

  // Forgot password - generate reset token
  router.post('/forgot-password', async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      // Always return success to prevent email enumeration
      const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userResult.rows.length === 0) {
        return res.json({ message: 'If that email is registered, a reset link has been sent.' });
      }

      const userId = userResult.rows[0].id;
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate any existing tokens for this user
      await pool.query(
        'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
        [userId]
      );

      await pool.query(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, token, expiresAt]
      );

      // Log the token (email sending to be added later)
      logger.info('Password reset token generated', { userId, token, expiresAt: expiresAt.toISOString() });

      res.json({ message: 'If that email is registered, a reset link has been sent.' });
    } catch (err) {
      next(err);
    }
  });

  // Reset password with token
  router.post('/reset-password', async (req, res, next) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
      if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

      const tokenResult = await pool.query(
        'SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = $1',
        [token]
      );

      if (tokenResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      const resetRecord = tokenResult.rows[0];

      if (resetRecord.used) {
        return res.status(400).json({ error: 'This reset token has already been used' });
      }

      if (new Date(resetRecord.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, resetRecord.user_id]);
      await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE token = $1', [token]);

      logger.info('Password reset successful', { userId: resetRecord.user_id });
      res.json({ message: 'Password has been reset successfully.' });
    } catch (err) {
      next(err);
    }
  });

  return router;
};

// Google token verification using google-auth-library
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch {
    return null;
  }
}
