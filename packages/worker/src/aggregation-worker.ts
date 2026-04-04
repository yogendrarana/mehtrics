import { db } from "@mehtrics/db";
import {
  site,
  event,
  aggregatedDailyStat,
  type AggregatedDailyStatInsert,
} from "@mehtrics/db/schema";
import { eq, and, gte, lt, count, sql } from "@mehtrics/db/drizzle";

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

  const sessionPageviews = await db
    .select({
      sessionId: event.sessionId,
      pvCount: count(),
    })
    .from(event)
    .where(and(baseFilter, eq(event.type, "pageview")))
    .groupBy(event.sessionId);

  const totalSessions = sessionPageviews.length;
  const bounces = sessionPageviews.filter((s) => s.pvCount === 1).length;

  if (totalSessions > 0) {
    rows.push({
      siteId,
      date: dateStr,
      metric: "sessions",
      value: totalSessions,
    });

    rows.push({
      siteId,
      date: dateStr,
      metric: "bounces",
      value: bounces,
    });

    const bounceRate = (bounces / totalSessions) * 100;
    rows.push({
      siteId,
      date: dateStr,
      metric: "bounce_rate",
      value: Math.round(bounceRate * 100) / 100,
    });
  }

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

  const dimBreakdowns: Array<{ name: string; column: any }> = [
    { name: "referrer", column: event.referrer },
    { name: "country", column: event.country },
    { name: "region", column: event.region },
    { name: "city", column: event.city },
    { name: "browser", column: event.browser },
    { name: "device", column: event.device },
  ];

  for (const dim of dimBreakdowns) {
    const results = await db
      .select({
        dimension: dim.column,
        value: count(),
      })
      .from(event)
      .where(and(baseFilter, sql`${dim.column} IS NOT NULL`))
      .groupBy(dim.column)
      .orderBy(sql`count(*) DESC`)
      .limit(100);

    for (const res of results) {
      if (!res.dimension) continue;
      rows.push({
        siteId,
        date: dateStr,
        metric: "pageviews",
        value: res.value,
        dimension: `${dim.name}:${res.dimension}`,
      });
    }
  }

  if (rows.length > 0) {
    await db.insert(aggregatedDailyStat).values(rows).onConflictDoNothing();
  }

  console.log(
    `[Aggregation] Site ${siteId}: ${rows.length} rows written for ${dateStr}`,
  );
}

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
