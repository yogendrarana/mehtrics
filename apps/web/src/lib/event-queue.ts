import { getRedisClient } from "./redis";

/**
 * ======================================================
 * Event Queue
 * ======================================================
 *
 * Uses a Redis LIST as a simple FIFO queue.
 * Producer (track route) uses LPUSH.
 * Consumer (worker) uses BRPOP / batch RPOP.
 */

export const EVENT_QUEUE_KEY = "mehtrics:event:queue";

export type QueuedEvent = {
  siteId: string;
  type: "pageview" | "custom";
  url: string;
  referrer?: string | null;
  pathname?: string | null;
  visitorHash?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  browser?: string | null;
  browserVersion?: string | null;
  os?: string | null;
  device?: "desktop" | "mobile" | "tablet" | "unknown" | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  query?: string | null;
  sessionId?: string | null;
  duration?: number | null;
  eventName?: string | null;
  enqueuedAt: number;
};

/**
 * Push a single event to the Redis queue.
 */
export async function enqueueEvent(event: QueuedEvent): Promise<void> {
  const redis = getRedisClient();
  await redis.lpush(EVENT_QUEUE_KEY, JSON.stringify(event));
}

/**
 * Pop a batch of events from the queue for processing.
 * Returns at most `batchSize` events.
 */
export async function dequeueBatch(batchSize = 500): Promise<QueuedEvent[]> {
  const redis = getRedisClient();
  const pipeline = redis.pipeline();

  // RPOP multiple from the list atomically
  for (let i = 0; i < batchSize; i++) {
    pipeline.rpop(EVENT_QUEUE_KEY);
  }

  const results = await pipeline.exec();
  if (!results) return [];

  const eventList: QueuedEvent[] = [];
  for (const [err, value] of results) {
    if (!err && value && typeof value === "string") {
      try {
        eventList.push(JSON.parse(value) as QueuedEvent);
      } catch {
        // skip malformed
      }
    }
  }

  return eventList;
}

/**
 * Get the current queue depth (for monitoring).
 */
export async function getQueueDepth(): Promise<number> {
  const redis = getRedisClient();
  return redis.llen(EVENT_QUEUE_KEY);
}
