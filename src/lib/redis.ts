import { createClient } from 'redis';
import { config } from '../config';
import { logger } from './logger';

export const redis = createClient({ url: config.redisUrl });

redis.on('error', (err) => logger.error({ err }, 'Redis client error'));

export async function connectRedis(): Promise<void> {
  if (!redis.isOpen) {
    await redis.connect();
    logger.info('Redis connected');
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis.isOpen) {
    await redis.quit();
  }
}
