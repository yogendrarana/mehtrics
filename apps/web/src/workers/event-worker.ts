import { db } from "@mehtrics/db";
import { event, type EventInsert } from "@mehtrics/db/schema";
import {
  dequeueBatch,
  getQueueDepth,
  type QueuedEvent,
} from "@/lib/analytics/event-queue";
import { ANALYTICS_CONFIG } from "@/constants";

const { POLL_INTERVAL_MS, BATCH_SIZE } = ANALYTICS_CONFIG;

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
    batch = await dequeueBatch(BATCH_SIZE);
  } catch (err) {
    console.error("[Worker] Failed to dequeue batch:", err);
    return;
  }

  if (batch.length === 0) return;

  const rows = batch.map(mapQueuedEventToInsert);

  try {
    // Bulk insert — Drizzle uses $batches internally for large inserts
    console.log(`[Worker] Attempting to insert ${rows.length} events...`);
    await db.insert(event).values(rows);
    console.log(`[Worker] Successfully inserted ${rows.length} events.`);
  } catch (err) {
    console.error("[Worker] Bulk insert failed:", err);
    // If bulk fails, we've already popped them from Redis!
    // TODO: Consider inserting one-by-one or pushing to DLQ to avoid losing whole batch
    // For now, at least we log the error.
  }
}

async function runWorker(): Promise<void> {
  console.log(
    `[Worker] Starting — polling every ${POLL_INTERVAL_MS}ms, batch size ${BATCH_SIZE}`,
  );

  const tick = async () => {
    try {
      const depth = await getQueueDepth();
      if (depth > 0) {
        console.log(`[Worker] Queue depth: ${depth}`);
        await processBatch();
      } else {
        console.log("[Worker] Queue is empty.");
      }
    } catch (err) {
      console.error("[Worker] Tick error:", err);
    }
    setTimeout(tick, POLL_INTERVAL_MS);
  };

  await tick();
}

// Graceful shutdown
const handleShutdown = async () => {
  console.log("[Worker] Shutting down gracefully...");
  process.exit(0);
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

// Self-invoking when run directly
runWorker().catch((err) => {
  console.error("[Worker] Fatal error:", err);
  process.exit(1);
});
