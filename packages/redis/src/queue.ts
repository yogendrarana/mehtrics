import type Redis from "ioredis";
import { EVENT_QUEUE_KEY } from "./constants";
import { type QueuedEvent } from "./types";

/**
 * Push a single event to the Redis queue.
 */
export async function enqueueEvent(redis: Redis, event: QueuedEvent): Promise<void> {
  await redis.lpush(EVENT_QUEUE_KEY, JSON.stringify(event));
}

/**
 * Pop a batch of events from the queue for processing.
 * Returns at most `batchSize` events.
 */
export async function dequeueBatch(redis: Redis, batchSize = 500): Promise<QueuedEvent[]> {
  const pipeline = redis.pipeline();

  // RPOP multiple from the list atomically
  for (let i = 0; i < batchSize; i++) {
    pipeline.rpop(EVENT_QUEUE_KEY);
  }

  const results = await pipeline.exec();
  if (!results) return [];

  const eventList: QueuedEvent[] = [];
  for (const [err, value] of results) {
    if (err) {
      console.error("[Redis] Pipeline error:", err);
      continue;
    }
    if (value && typeof value === "string") {
      try {
        eventList.push(JSON.parse(value) as QueuedEvent);
      } catch (err) {
        console.warn("[Redis] Failed to parse queued event:", err);
      }
    }
  }

  return eventList;
}

/**
 * Get the current queue depth (for monitoring).
 */
export async function getQueueDepth(redis: Redis): Promise<number> {
  return redis.llen(EVENT_QUEUE_KEY);
}
