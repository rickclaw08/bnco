/**
 * ClawOps Scanner - Redis Client for GEO Query Caching
 * Provides 24h TTL cache with graceful fallback
 */

import Redis from 'ioredis';
import { logger } from './logger';

let redisClient: Redis | null = null;
let isRedisAvailable = false;

try {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = new Redis(redisUrl, {
    retryStrategy: (times: number) => {
      if (times > 3) {
        logger.warn('[Redis] Max connection retries reached, disabling cache');
        return null;
      }
      return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    logger.info('[Redis] Connected successfully');
  });

  redisClient.on('error', (error) => {
    isRedisAvailable = false;
    logger.warn('[Redis] Connection error, cache disabled', { error: error.message });
  });

  redisClient.on('close', () => {
    isRedisAvailable = false;
    logger.warn('[Redis] Connection closed');
  });

  redisClient.connect().catch((error) => {
    logger.warn('[Redis] Initial connection failed, running without cache', { error: error.message });
    isRedisAvailable = false;
  });
} catch (error: any) {
  logger.warn('[Redis] Failed to initialize, running without cache', { error: error.message });
  redisClient = null;
  isRedisAvailable = false;
}

export function getRedisClient(): Redis | null {
  return redisClient;
}

export function isRedisConnected(): boolean {
  return isRedisAvailable;
}

export const geoQueryCache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redisClient || !isRedisAvailable) return null;
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error: any) {
      logger.warn('[Redis Cache] Get failed', { key, error: error.message });
      return null;
    }
  },

  async set(key: string, value: any): Promise<void> {
    if (!redisClient || !isRedisAvailable) return;
    try {
      const ttl = 24 * 60 * 60;
      await redisClient.setex(key, ttl, JSON.stringify(value));
    } catch (error: any) {
      logger.warn('[Redis Cache] Set failed', { key, error: error.message });
    }
  },

  async delete(key: string): Promise<void> {
    if (!redisClient || !isRedisAvailable) return;
    try {
      await redisClient.del(key);
    } catch (error: any) {
      logger.warn('[Redis Cache] Delete failed', { key, error: error.message });
    }
  },

  isAvailable(): boolean {
    return isRedisAvailable;
  },
};

process.on('SIGTERM', async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('[Redis] Connection closed gracefully');
  }
});
