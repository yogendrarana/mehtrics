import { db, event, type EventInsert } from "@mehtrics/db";
import { dequeueBatch, getQueueDepth, type QueuedEvent } from "./event-queue";

/**
 * ===================================================
 * Batch Worker
 * ===================================================
 *
 * Polls the Redis queue every POLL_INTERVAL_MS and bulk-inserts
 * up to BATCH_SIZE events per tick into PostgreSQL.
 *
 * Run as a standalone Bun process:
 *   bun run apps/web/src/lib/worker.ts
 */

const POLL_INTERVAL_MS = 5_000; // 5 seconds
const BATCH_SIZE = 500; // events per DB insert

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
  const batch = await dequeueBatch(BATCH_SIZE);
  if (batch.length === 0) return;

  const rows = batch.map(mapQueuedEventToInsert);

  try {
    // Bulk insert — Drizzle uses $batches internally for large inserts
    await db.insert(event).values(rows);
    console.log(`[Worker] Inserted ${rows.length} events.`);
  } catch (err) {
    console.error("[Worker] Bulk insert failed:", err);
    // TODO: Push failed batch to a dead-letter queue for retry
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
