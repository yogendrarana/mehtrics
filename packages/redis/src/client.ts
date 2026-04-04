import Redis from "ioredis";

let redisClient: Redis | null = null;

/**
 * Returns a singleton Redis client instance from environment variables.
 */
export function getRedisClient(): Redis {
  if (redisClient) return redisClient;

  const REDIS_URL = process.env["REDIS_URL"];
  if (!REDIS_URL) {
    throw new Error("[Redis] REDIS_URL environment variable is not set.");
  }

  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  redisClient.on("error", (err: Error) => {
    console.error("[Redis] Connection error:", err.message);
  });

  redisClient.on("connect", () => {
    console.log("[Redis] Connected.");
  });

  return redisClient;
}
