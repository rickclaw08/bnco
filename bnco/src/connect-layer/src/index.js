require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Centralized config imports
const pool = require('./config/database');
const redis = require('./config/redis');

// Logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

// Express
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '8mb' }));

// Rate limiters for auth endpoints
const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authRegisterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bnco-connect-layer', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth/login', authLoginLimiter);
app.use('/api/auth/register', authRegisterLimiter);
app.use('/api/auth', require('./routes/auth.routes')(pool, logger));
app.use('/api/users', require('./routes/user.routes')(pool, redis, logger));
app.use('/api/onboarding', require('./routes/onboarding.routes')(pool, redis, logger));
app.use('/api/workouts', require('./routes/workout.routes')(pool, redis, logger));
app.use('/api/studios', require('./routes/studio.routes')(pool, redis, logger));
app.use('/api/studios', require('./routes/membership.routes')(pool, redis, logger));
app.use('/api/challenges', require('./routes/challenge.routes')(pool, logger));
app.use('/api/lobby', require('./routes/lobby.routes')(pool, redis, logger));
app.use('/api/webhooks', require('./routes/webhook.routes')(pool, redis, logger));
app.use('/api/social', require('./routes/social.routes')(pool, redis, logger));

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// Start
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`bnco Connect Layer running on port ${PORT}`);
});

module.exports = app;
