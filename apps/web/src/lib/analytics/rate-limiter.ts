import { getRedisClient } from "@/config/redis";

/**
 * Sliding window rate limiter backed by Redis
 * Uses a sorted set per key (ip or siteId).
 * Each member is a unique timestamp so concurrent requests are tracked.
 */

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 300; // per window per key

export async function checkRateLimit(key: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  const redis = getRedisClient();
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const redisKey = `rl:track:${key}`;

  // Sliding window: remove old entries, add current, count
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(redisKey, "-inf", windowStart);
  pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);
  pipeline.zcard(redisKey);
  pipeline.pexpire(redisKey, WINDOW_MS);

  const results = await pipeline.exec();
  const count = (results?.[2]?.[1] as number) ?? 0;

  const allowed = count <= MAX_REQUESTS;
  const remaining = Math.max(0, MAX_REQUESTS - count);
  const resetAt = now + WINDOW_MS;

  return { allowed, remaining, resetAt };
}
