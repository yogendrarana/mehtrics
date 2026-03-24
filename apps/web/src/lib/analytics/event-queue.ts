import { getRedisClient } from "@/config/redis";
import { 
  type TEventType, 
  type TDeviceType, 
  type QueuedEvent, 
} from "@/lib/types";
import { EVENT_QUEUE_KEY } from "@/lib/constants";

export type { TEventType, TDeviceType, QueuedEvent };

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
