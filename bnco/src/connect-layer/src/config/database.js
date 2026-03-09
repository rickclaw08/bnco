// src/config/database.js - PostgreSQL connection pool
// Centralized database configuration for bnco connect-layer

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  min: 0,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
  // Pool will automatically create new connections on next query.
  // No need to crash - pg Pool handles reconnection internally.
});

module.exports = pool;
