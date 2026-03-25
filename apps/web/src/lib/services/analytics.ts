import { db } from "@mehtrics/db";
import { and, count, desc, eq, gte, lt, sql } from "@mehtrics/db/drizzle";
import { event as eventTable, site as siteTable } from "@mehtrics/db/schema";
import { differenceInHours } from "date-fns";
import { fillSeriesGaps } from "@/lib/analytics-utils";

/**
 * Fetch global analytics stats for a specific user across all their sites.
 */
export async function getGlobalStats(userId: string, start: Date, end: Date) {
  const filter = and(
    eq(siteTable.userId, userId),
    gte(eventTable.createdAt, start),
    lt(eventTable.createdAt, end),
  );

  const [
    [pvResult],
    [uvResult],
    [evResult],
    [siteCount],
    topPages,
    topReferrers,
    globalBounceResult,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(eventTable)
      .innerJoin(siteTable, eq(eventTable.siteId, siteTable.id))
      .where(and(filter, eq(eventTable.type, "pageview"))),

    db
      .select({ value: sql<number>`COUNT(DISTINCT ${eventTable.visitorHash})` })
      .from(eventTable)
      .innerJoin(siteTable, eq(eventTable.siteId, siteTable.id))
      .where(filter),

    db
      .select({ value: count() })
      .from(eventTable)
      .innerJoin(siteTable, eq(eventTable.siteId, siteTable.id))
      .where(and(filter, eq(eventTable.type, "custom"))),

    db
      .select({ value: count() })
      .from(siteTable)
      .where(eq(siteTable.userId, userId)),

    db
      .select({
        pathname: eventTable.pathname,
        domain: siteTable.domain,
        views: count(),
      })
      .from(eventTable)
      .innerJoin(siteTable, eq(eventTable.siteId, siteTable.id))
      .where(and(filter, eq(eventTable.type, "pageview")))
      .groupBy(eventTable.pathname, siteTable.domain)
      .orderBy(desc(count()))
      .limit(10),

    db
      .select({ referrer: eventTable.referrer, visits: count() })
      .from(eventTable)
      .innerJoin(siteTable, eq(eventTable.siteId, siteTable.id))
      .where(
        and(
          filter,
          eq(eventTable.type, "pageview"),
          sql`${eventTable.referrer} IS NOT NULL`,
        ),
      )
      .groupBy(eventTable.referrer)
      .orderBy(desc(count()))
      .limit(10),

    // Global Bounce Rate Calculation
    db.execute(sql`
      WITH session_pvs AS (
        SELECT session_id, COUNT(*) as pv_count
        FROM event
        INNER JOIN site ON event.site_id = site.id
        WHERE site.user_id = ${userId} AND event.type = 'pageview' 
          AND event.created_at >= ${start.toISOString()} AND event.created_at < ${end.toISOString()}
        GROUP BY session_id
      )
      SELECT 
        COUNT(*)::float as total_sessions,
        COUNT(*) FILTER (WHERE pv_count = 1)::float as bounces
      FROM session_pvs
    `),
  ]);

  const bounceData = (globalBounceResult as any)?.rows?.[0] || {
    total_sessions: 0,
    bounces: 0,
  };
  const totalSessions = Number(bounceData.total_sessions);
  const bounces = Number(bounceData.bounces);
  const bounceRate = totalSessions > 0 ? (bounces / totalSessions) * 100 : 0;

  return {
    pageviews: pvResult?.value ?? 0,
    uniqueVisitors: uvResult?.value ?? 0,
    events: evResult?.value ?? 0,
    activeSites: siteCount?.value ?? 0,
    bounceRate: Math.round(bounceRate * 10) / 10,
    topPages,
    topReferrers,
  };
}

/**
 * Fetch detailed analytics data for a specific site.
 */
export async function getAnalyticsData(siteId: string, start: Date, end: Date) {
  const diffHours = differenceInHours(end, start);
  const granularity = diffHours <= 24 ? "hour" : "day";
  const truncSql =
    granularity === "hour"
      ? sql`DATE_TRUNC('hour', ${eventTable.createdAt})`
      : sql`DATE_TRUNC('day', ${eventTable.createdAt})`;

  const filter = and(
    eq(eventTable.siteId, siteId),
    gte(eventTable.createdAt, start),
    lt(eventTable.createdAt, end),
  );
  const pageviewFilter = and(filter, eq(eventTable.type, "pageview"));
  const customEventFilter = and(filter, eq(eventTable.type, "custom"));

  const [
    [pvResult],
    [uvResult],
    [evResult],
    viewsSeries,
    visitorsSeries,
    eventsSeries,
    topPages,
    topReferrers,
    topCountries,
    topDevices,
    topBrowsers,
    topOS,
    bounceResult,
  ] = await Promise.all([
    db.select({ value: count() }).from(eventTable).where(pageviewFilter),
    db
      .select({ value: sql<number>`COUNT(DISTINCT ${eventTable.visitorHash})` })
      .from(eventTable)
      .where(filter),
    db.select({ value: count() }).from(eventTable).where(customEventFilter),

    db
      .select({ date: truncSql, value: count() })
      .from(eventTable)
      .where(pageviewFilter)
      .groupBy(truncSql)
      .orderBy(truncSql),

    db
      .select({
        date: truncSql,
        value: sql<number>`COUNT(DISTINCT ${eventTable.visitorHash})`,
      })
      .from(eventTable)
      .where(filter)
      .groupBy(truncSql)
      .orderBy(truncSql),

    db
      .select({ date: truncSql, value: count() })
      .from(eventTable)
      .where(customEventFilter)
      .groupBy(truncSql)
      .orderBy(truncSql),

    db
      .select({ label: eventTable.pathname, value: count() })
      .from(eventTable)
      .where(pageviewFilter)
      .groupBy(eventTable.pathname)
      .orderBy(desc(count()))
      .limit(10),

    db
      .select({ label: eventTable.referrer, value: count() })
      .from(eventTable)
      .where(and(pageviewFilter, sql`${eventTable.referrer} IS NOT NULL`))
      .groupBy(eventTable.referrer)
      .orderBy(desc(count()))
      .limit(10),

    db
      .select({ label: eventTable.country, value: count() })
      .from(eventTable)
      .where(and(pageviewFilter, sql`${eventTable.country} IS NOT NULL`))
      .groupBy(eventTable.country)
      .orderBy(desc(count()))
      .limit(10),

    db
      .select({ label: eventTable.device, value: count() })
      .from(eventTable)
      .where(and(pageviewFilter, sql`${eventTable.device} IS NOT NULL`))
      .groupBy(eventTable.device)
      .orderBy(desc(count())),

    db
      .select({ label: eventTable.browser, value: count() })
      .from(eventTable)
      .where(and(pageviewFilter, sql`${eventTable.browser} IS NOT NULL`))
      .groupBy(eventTable.browser)
      .orderBy(desc(count())),

    db
      .select({ label: eventTable.os, value: count() })
      .from(eventTable)
      .where(and(pageviewFilter, sql`${eventTable.os} IS NOT NULL`))
      .groupBy(eventTable.os)
      .orderBy(desc(count())),

    // Bounce Rate Calculation
    db.execute(sql`
      WITH session_pvs AS (
        SELECT session_id, COUNT(*) as pv_count
        FROM event
        WHERE site_id = ${siteId} AND type = 'pageview' 
          AND created_at >= ${start.toISOString()} AND created_at < ${end.toISOString()}
        GROUP BY session_id
      )
      SELECT 
        COUNT(*)::float as total_sessions,
        COUNT(*) FILTER (WHERE pv_count = 1)::float as bounces
      FROM session_pvs
    `),
  ]);

  const bounceData = (bounceResult as any)?.rows?.[0] || {
    total_sessions: 0,
    bounces: 0,
  };
  const totalSessions = Number(bounceData.total_sessions);
  const bounces = Number(bounceData.bounces);
  const bounceRate = totalSessions > 0 ? (bounces / totalSessions) * 100 : 0;

  return {
    totals: {
      pageviews: pvResult?.value ?? 0,
      visitors: uvResult?.value ?? 0,
      events: evResult?.value ?? 0,
      bounceRate: Math.round(bounceRate * 10) / 10,
    },
    series: {
      views: fillSeriesGaps(viewsSeries as any, start, end),
      visitors: fillSeriesGaps(visitorsSeries as any, start, end),
      events: fillSeriesGaps(eventsSeries as any, start, end),
    },
    breakdowns: {
      pages: topPages.map((p) => ({ label: p.label ?? "/", value: p.value })),
      referrers: topReferrers.map((r) => ({
        label: r.label ?? "Direct",
        value: r.value,
      })),
      countries: topCountries.map((c) => ({
        label: c.label || "Unknown",
        value: c.value,
      })),
      devices: topDevices.map((d) => ({
        label: d.label || "unknown",
        value: d.value,
      })),
      browsers: topBrowsers.map((b) => ({
        label: b.label || "unknown",
        value: b.value,
      })),
      os: (topOS as any).map((o: any) => ({
        label: o.label || "unknown",
        value: o.value,
      })),
    },
  };
}
