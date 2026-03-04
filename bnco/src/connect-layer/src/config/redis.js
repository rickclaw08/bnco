// src/config/redis.js - Redis (ioredis) connection
// Centralized Redis configuration for bnco connect-layer

const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

module.exports = redis;
