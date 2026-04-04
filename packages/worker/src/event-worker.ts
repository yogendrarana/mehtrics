import { db } from "@mehtrics/db";
import { event, type EventInsert } from "@mehtrics/db/schema";
import {
  dequeueBatch,
  getQueueDepth,
  type QueuedEvent,
  ANALYTICS_CONFIG,
  getRedisClient,
} from "@mehtrics/redis";

const { POLL_INTERVAL_MS, BATCH_SIZE } = ANALYTICS_CONFIG;

const redis = getRedisClient();

function mapQueuedEventToInsert(e: QueuedEvent): EventInsert {
  return {
    siteId: e.siteId,
    type: e.type,
    url: e.url,
    referrer: e.referrer ?? null,
    pathname: e.pathname ?? "/",
    visitorHash: e.visitorHash ?? null,
    country: e.country ?? null,
    region: e.region ?? null,
    city: e.city ?? null,
    browser: e.browser ?? null,
    browserVersion: e.browserVersion ?? null,
    os: e.os ?? null,
    device: e.device ?? "unknown",
    screenWidth: e.screenWidth ?? null,
    screenHeight: e.screenHeight ?? null,
    query: e.query ?? null,
    sessionId: e.sessionId ?? null,
    duration: e.duration ?? null,
    eventName: e.eventName ?? null,
    createdAt: new Date(e.enqueuedAt),
  };
}

async function processBatch(): Promise<void> {
  let batch: QueuedEvent[] = [];
  try {
    batch = await dequeueBatch(redis, BATCH_SIZE);
  } catch (err) {
    console.error("[Worker] Failed to dequeue batch:", err);
    return;
  }

  if (batch.length === 0) return;

  const rows = batch.map(mapQueuedEventToInsert);

  try {
    console.log(`[Worker] Attempting to insert ${rows.length} events...`);
    await db.insert(event).values(rows);
    console.log(`[Worker] Successfully inserted ${rows.length} events.`);
  } catch (err) {
    console.error("[Worker] Bulk insert failed:", err);
  }
}

async function runWorker(): Promise<void> {
  console.log(
    `[Worker] Starting — polling every ${POLL_INTERVAL_MS}ms, batch size ${BATCH_SIZE}`,
  );

  const tick = async () => {
    try {
      const depth = await getQueueDepth(redis);
      if (depth > 0) {
        console.log(`[Worker] Queue depth: ${depth}`);
        await processBatch();
      }
    } catch (err) {
      console.error("[Worker] Tick error:", err);
    }
    setTimeout(tick, POLL_INTERVAL_MS);
  };

  await tick();
}

const handleShutdown = async () => {
  console.log("[Worker] Shutting down gracefully...");
  await redis.quit();
  process.exit(0);
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

runWorker().catch((err) => {
  console.error("[Worker] Fatal error:", err);
  process.exit(1);
});
