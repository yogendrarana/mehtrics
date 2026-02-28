/**
 * Aggregation Worker
 * ==================
 * Runs daily (typically at 00:05 UTC) to compute analytics rollups
 * from raw events and store them in aggregated_daily_stats.
 *
 * Run with:
 *   bun run packages/analytics/src/aggregation-worker.ts
 *
 * Or schedule with cron:
 *   5 0 * * * bun run /app/packages/analytics/src/aggregation-worker.ts
 */

import {
  db,
  sites,
  events,
  aggregatedDailyStats,
  eq,
  and,
  gte,
  lt,
  count,
  sql,
} from "@mehtrics/db";

// ---- Types ----
type AggregationMetric =
  | "pageviews"
  | "unique_visitors"
  | "bounce_rate"
  | "avg_duration";

type InsertableAgg = typeof aggregatedDailyStats.$inferInsert;

// ============================================================
// Get the date range for yesterday
// ============================================================
function getYesterdayRange(): { start: Date; end: Date; dateStr: string } {
  const now = new Date();
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 1);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const dateStr = start.toISOString().slice(0, 10);
  return { start, end, dateStr };
}

// ============================================================
// Aggregate a single site for a given date
// ============================================================
async function aggregateSite(
  siteId: string,
  start: Date,
  end: Date,
  dateStr: string,
): Promise<void> {
  const rows: InsertableAgg[] = [];

  const baseFilter = and(
    eq(events.siteId, siteId),
    gte(events.createdAt, start),
    lt(events.createdAt, end),
  );

  // 1. Total pageviews
  const [pvResult] = await db
    .select({ value: count() })
    .from(events)
    .where(baseFilter);

  if (pvResult) {
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews" as AggregationMetric,
      value: pvResult.value,
    });
  }

  // 2. Unique visitors (by visitorHash)
  const [uvResult] = await db
    .select({
      value: sql<number>`COUNT(DISTINCT ${events.visitorHash})`,
    })
    .from(events)
    .where(baseFilter);

  if (uvResult) {
    rows.push({
      siteId,
      date: dateStr,
      metric: "unique_visitors" as AggregationMetric,
      value: uvResult.value,
    });
  }

  // 3. Top pages (pathname breakdown)
  const topPages = await db
    .select({
      dimension: events.pathname,
      value: count(),
    })
    .from(events)
    .where(baseFilter)
    .groupBy(events.pathname)
    .orderBy(sql`count(*) DESC`)
    .limit(100);

  for (const page of topPages) {
    if (!page.dimension) continue;
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews" as AggregationMetric,
      value: page.value,
      dimension: page.dimension,
    });
  }

  // 4. Referrer breakdown
  const referrers = await db
    .select({
      dimension: events.referrer,
      value: count(),
    })
    .from(events)
    .where(and(baseFilter, sql`${events.referrer} IS NOT NULL`))
    .groupBy(events.referrer)
    .orderBy(sql`count(*) DESC`)
    .limit(100);

  for (const ref of referrers) {
    if (!ref.dimension) continue;
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews" as AggregationMetric,
      value: ref.value,
      dimension: `referrer:${ref.dimension}`,
    });
  }

  // 5. Country breakdown
  const countries = await db
    .select({
      dimension: events.country,
      value: count(),
    })
    .from(events)
    .where(and(baseFilter, sql`${events.country} IS NOT NULL`))
    .groupBy(events.country)
    .orderBy(sql`count(*) DESC`);

  for (const c of countries) {
    if (!c.dimension) continue;
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews" as AggregationMetric,
      value: c.value,
      dimension: `country:${c.dimension}`,
    });
  }

  // 6. Browser breakdown
  const browsers = await db
    .select({
      dimension: events.browser,
      value: count(),
    })
    .from(events)
    .where(and(baseFilter, sql`${events.browser} IS NOT NULL`))
    .groupBy(events.browser)
    .orderBy(sql`count(*) DESC`);

  for (const b of browsers) {
    if (!b.dimension) continue;
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews" as AggregationMetric,
      value: b.value,
      dimension: `browser:${b.dimension}`,
    });
  }

  // 7. Device breakdown
  const devices = await db
    .select({
      dimension: events.device,
      value: count(),
    })
    .from(events)
    .where(and(baseFilter, sql`${events.device} IS NOT NULL`))
    .groupBy(events.device)
    .orderBy(sql`count(*) DESC`);

  for (const d of devices) {
    if (!d.dimension) continue;
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews" as AggregationMetric,
      value: d.value,
      dimension: `device:${d.dimension}`,
    });
  }

  // Bulk upsert
  if (rows.length > 0) {
    await db.insert(aggregatedDailyStats).values(rows).onConflictDoNothing();
  }

  console.log(
    `[Aggregation] Site ${siteId}: ${rows.length} rows written for ${dateStr}`,
  );
}

// ============================================================
// Main runner
// ============================================================
async function runAggregation(): Promise<void> {
  const { start, end, dateStr } = getYesterdayRange();
  console.log(`[Aggregation] Running for date: ${dateStr}`);

  const allSites = await db.select({ id: sites.id }).from(sites);
  console.log(`[Aggregation] Found ${allSites.length} sites to process.`);

  for (const site of allSites) {
    try {
      await aggregateSite(site.id, start, end, dateStr);
    } catch (err) {
      console.error(`[Aggregation] Failed for site ${site.id}:`, err);
    }
  }

  console.log("[Aggregation] Complete.");
  process.exit(0);
}

runAggregation().catch((err) => {
  console.error("[Aggregation] Fatal:", err);
  process.exit(1);
});
