import { getUserId } from "@/lib/auth";
import { db } from "@mehtrics/db";
import { and, count, desc, eq, gte, lt, sql } from "@mehtrics/db/drizzle";
import { event as eventTable, site as siteTable } from "@mehtrics/db/schema";
import { notFound } from "next/navigation";
import { differenceInHours } from "date-fns";

import { SiteOverviewWrapper } from "./__components/site-overview-wrapper";
import { fillSeriesGaps, parseSearchParams } from "@/lib/analytics-utils";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getAnalyticsData(siteId: string, start: Date, end: Date) {
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

  // Run all breakdown queries in parallel
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
  ] = await Promise.all([
    // Totals
    db
      .select({ value: count() })
      .from(eventTable)
      .where(pageviewFilter),
    db
      .select({ value: sql<number>`COUNT(DISTINCT ${eventTable.visitorHash})` })
      .from(eventTable)
      .where(filter),
    db.select({ value: count() }).from(eventTable).where(customEventFilter),

    // Pageviews per interval
    db
      .select({
        date: truncSql,
        value: count(),
      })
      .from(eventTable)
      .where(pageviewFilter)
      .groupBy(truncSql)
      .orderBy(truncSql),

    // Unique visitors per interval
    db
      .select({
        date: truncSql,
        value: sql<number>`COUNT(DISTINCT ${eventTable.visitorHash})`,
      })
      .from(eventTable)
      .where(filter)
      .groupBy(truncSql)
      .orderBy(truncSql),

    // Custom events per interval
    db
      .select({
        date: truncSql,
        value: count(),
      })
      .from(eventTable)
      .where(customEventFilter)
      .groupBy(truncSql)
      .orderBy(truncSql),

    // Top Pages
    db
      .select({ label: eventTable.pathname, value: count() })
      .from(eventTable)
      .where(pageviewFilter)
      .groupBy(eventTable.pathname)
      .orderBy(desc(count()))
      .limit(10),

    // Top Referrers
    db
      .select({ label: eventTable.referrer, value: count() })
      .from(eventTable)
      .where(and(pageviewFilter, sql`${eventTable.referrer} IS NOT NULL`))
      .groupBy(eventTable.referrer)
      .orderBy(desc(count()))
      .limit(10),

    // Top Countries
    db
      .select({ label: eventTable.country, value: count() })
      .from(eventTable)
      .where(and(pageviewFilter, sql`${eventTable.country} IS NOT NULL`))
      .groupBy(eventTable.country)
      .orderBy(desc(count()))
      .limit(10),

    // Top Devices
    db
      .select({ label: eventTable.device, value: count() })
      .from(eventTable)
      .where(and(pageviewFilter, sql`${eventTable.device} IS NOT NULL`))
      .groupBy(eventTable.device)
      .orderBy(desc(count())),

    // Top Browsers
    db
      .select({ label: eventTable.browser, value: count() })
      .from(eventTable)
      .where(and(pageviewFilter, sql`${eventTable.browser} IS NOT NULL`))
      .groupBy(eventTable.browser)
      .orderBy(desc(count())),

    // Top OS
    db
      .select({ label: eventTable.os, value: count() })
      .from(eventTable)
      .where(and(pageviewFilter, sql`${eventTable.os} IS NOT NULL`))
      .groupBy(eventTable.os)
      .orderBy(desc(count())),
  ]);

  return {
    totals: {
      pageviews: pvResult?.value ?? 0,
      visitors: uvResult?.value ?? 0,
      events: evResult?.value ?? 0,
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
      os: topOS.map((o) => ({ label: o.label || "unknown", value: o.value })),
    },
  };
}

export default async function SiteAnalyticsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sParams = await searchParams;

  // Auth check
  const userId = await getUserId();
  if (!userId) return null;

  // Load site
  const [siteData] = await db
    .select()
    .from(siteTable)
    .where(and(eq(siteTable.id, id), eq(siteTable.userId, userId)))
    .limit(1);

  if (!siteData) notFound();

  const { from, to } = parseSearchParams(sParams);
  const data = await getAnalyticsData(siteData.id, from, to);

  return (
    <div className="flex flex-col w-full h-full relative">
      <SiteOverviewWrapper initialData={data} />
    </div>
  );
}
