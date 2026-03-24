/**
 * ================================
 * Aggregation Worker
 * ================================
 *
 * Runs daily (typically at 00:05 UTC) to compute analytics rollups
 * from raw events and store them in aggregated_daily_stats.
 *
 * Run with:
 *   bun run src/workers/aggregation-worker.ts
 */

import { db } from "@mehtrics/db";
import {
  site,
  event,
  aggregatedDailyStat,
  type AggregatedDailyStatInsert,
} from "@mehtrics/db/schema";
import { eq, and, gte, lt, count, sql } from "@mehtrics/db/drizzle";

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
  const rows: AggregatedDailyStatInsert[] = [];

  const baseFilter = and(
    eq(event.siteId, siteId),
    gte(event.createdAt, start),
    lt(event.createdAt, end),
  );

  // 1. Total pageviews
  const [pvResult] = await db
    .select({ value: count() })
    .from(event)
    .where(baseFilter);

  if (pvResult) {
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews",
      value: pvResult.value,
    });
  }

  // 2. Unique visitors (by visitorHash)
  const [uvResult] = await db
    .select({
      value: sql<number>`COUNT(DISTINCT ${event.visitorHash})`,
    })
    .from(event)
    .where(baseFilter);

  if (uvResult) {
    rows.push({
      siteId,
      date: dateStr,
      metric: "unique_visitors",
      value: uvResult.value,
    });
  }

  // 3. Top pages (pathname breakdown)
  const topPages = await db
    .select({
      dimension: event.pathname,
      value: count(),
    })
    .from(event)
    .where(baseFilter)
    .groupBy(event.pathname)
    .orderBy(sql`count(*) DESC`)
    .limit(100);

  for (const page of topPages) {
    if (!page.dimension) continue;
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews",
      value: page.value,
      dimension: page.dimension,
    });
  }

  // 4. Referrer breakdown
  const referrers = await db
    .select({
      dimension: event.referrer,
      value: count(),
    })
    .from(event)
    .where(and(baseFilter, sql`${event.referrer} IS NOT NULL`))
    .groupBy(event.referrer)
    .orderBy(sql`count(*) DESC`)
    .limit(100);

  for (const ref of referrers) {
    if (!ref.dimension) continue;
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews",
      value: ref.value,
      dimension: `referrer:${ref.dimension}`,
    });
  }

  // 5. Country breakdown
  const countries = await db
    .select({
      dimension: event.country,
      value: count(),
    })
    .from(event)
    .where(and(baseFilter, sql`${event.country} IS NOT NULL`))
    .groupBy(event.country)
    .orderBy(sql`count(*) DESC`);

  for (const c of countries) {
    if (!c.dimension) continue;
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews",
      value: c.value,
      dimension: `country:${c.dimension}`,
    });
  }

  // 6. Region breakdown
  const regions = await db
    .select({
      dimension: event.region,
      value: count(),
    })
    .from(event)
    .where(and(baseFilter, sql`${event.region} IS NOT NULL`))
    .groupBy(event.region)
    .orderBy(sql`count(*) DESC`)
    .limit(100);

  for (const r of regions) {
    if (!r.dimension) continue;
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews",
      value: r.value,
      dimension: `region:${r.dimension}`,
    });
  }

  // 7. City breakdown
  const cities = await db
    .select({
      dimension: event.city,
      value: count(),
    })
    .from(event)
    .where(and(baseFilter, sql`${event.city} IS NOT NULL`))
    .groupBy(event.city)
    .orderBy(sql`count(*) DESC`)
    .limit(100);

  for (const city of cities) {
    if (!city.dimension) continue;
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews",
      value: city.value,
      dimension: `city:${city.dimension}`,
    });
  }

  // 6. Browser breakdown
  const browsers = await db
    .select({
      dimension: event.browser,
      value: count(),
    })
    .from(event)
    .where(and(baseFilter, sql`${event.browser} IS NOT NULL`))
    .groupBy(event.browser)
    .orderBy(sql`count(*) DESC`);

  for (const b of browsers) {
    if (!b.dimension) continue;
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews",
      value: b.value,
      dimension: `browser:${b.dimension}`,
    });
  }

  // 8. Device breakdown
  const devices = await db
    .select({
      dimension: event.device,
      value: count(),
    })
    .from(event)
    .where(and(baseFilter, sql`${event.device} IS NOT NULL`))
    .groupBy(event.device)
    .orderBy(sql`count(*) DESC`);

  for (const d of devices) {
    if (!d.dimension) continue;
    rows.push({
      siteId,
      date: dateStr,
      metric: "pageviews",
      value: d.value,
      dimension: `device:${d.dimension}`,
    });
  }

  // Bulk upsert
  if (rows.length > 0) {
    await db.insert(aggregatedDailyStat).values(rows).onConflictDoNothing();
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

  const allSiteList = await db.select({ id: site.id }).from(site);
  console.log(`[Aggregation] Found ${allSiteList.length} sites to process.`);

  for (const s of allSiteList) {
    try {
      await aggregateSite(s.id, start, end, dateStr);
    } catch (err) {
      console.error(`[Aggregation] Failed for site ${s.id}:`, err);
    }
  }

  console.log("[Aggregation] Complete.");
  process.exit(0);
}

runAggregation().catch((err) => {
  console.error("[Aggregation] Fatal:", err);
  process.exit(1);
});
