import { config } from '../config';
import { redis } from './redis';
import { logger } from './logger';

export const cacheKeys = {
  trendingProducts: config.cache.trendingKeyPrefix,
} as const;

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    await redis.del(key);
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function cacheDel(key: string): Promise<void> {
  await redis.del(key);
}

export async function cacheDelByPrefix(prefix: string): Promise<void> {
  const keys: string[] = [];
  for await (const entry of redis.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
    if (Array.isArray(entry)) {
      keys.push(...entry);
    } else {
      keys.push(String(entry));
    }
  }
  await Promise.all(keys.map((key) => redis.del(key)));
}

export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    logger.debug({ key }, 'Cache hit');
    return cached;
  }

  logger.debug({ key }, 'Cache miss');
  const value = await fetcher();
  await cacheSet(key, value, ttlSeconds);
  return value;
}
