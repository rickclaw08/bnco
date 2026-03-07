/**
 * ClawOps Scanner - Express API Server
 * See How AI and Maps Find Your Business
 */

import express from 'express';
import cors from 'cors';
import { handleScan } from './api/scan';
import { handleMEOExplain } from './api/meoExplain';
import { handleGEOBenchmark, handleGEORefresh } from './api/geoBenchmark';
import { handleNearbyCompetitors } from './api/nearbyCompetitors';
import { handlePlacesAutocomplete } from './api/placesAutocomplete';
import { logger } from './lib/logger';

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'clawops-scanner',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.post('/api/scan', handleScan);
app.get('/api/meo/explain', handleMEOExplain);
app.get('/api/geo/benchmark', handleGEOBenchmark);
app.post('/api/geo/refresh', handleGEORefresh);
app.get('/api/nearby-competitors', handleNearbyCompetitors);
app.get('/api/places/autocomplete', handlePlacesAutocomplete);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  logger.error('[Server] Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`ClawOps Scanner API running on port ${PORT}`);
});

export default app;
