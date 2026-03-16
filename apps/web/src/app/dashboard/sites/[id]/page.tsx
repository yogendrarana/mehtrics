import { getSessionFromRequest } from "@mehtrics/auth";
import { db } from "@mehtrics/db";
import { and, count, desc, eq, gte, lt, sql } from "@mehtrics/db/drizzle";
import { event as eventTable, site as siteTable } from "@mehtrics/db/schema";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { SiteOverviewWrapper } from "./__components/site-overview-wrapper";

type PageProps = { params: Promise<{ id: string }> };

async function getAnalyticsData(siteId: string, start: Date, end: Date) {
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

    // Pageviews per day
    db
      .select({
        date: sql<string>`DATE_TRUNC('day', ${eventTable.createdAt})::DATE`,
        value: count(),
      })
      .from(eventTable)
      .where(pageviewFilter)
      .groupBy(sql`DATE_TRUNC('day', ${eventTable.createdAt})::DATE`)
      .orderBy(sql`DATE_TRUNC('day', ${eventTable.createdAt})::DATE`),

    // Unique visitors per day
    db
      .select({
        date: sql<string>`DATE_TRUNC('day', ${eventTable.createdAt})::DATE`,
        value: sql<number>`COUNT(DISTINCT ${eventTable.visitorHash})`,
      })
      .from(eventTable)
      .where(filter)
      .groupBy(sql`DATE_TRUNC('day', ${eventTable.createdAt})::DATE`)
      .orderBy(sql`DATE_TRUNC('day', ${eventTable.createdAt})::DATE`),

    // Custom events per day
    db
      .select({
        date: sql<string>`DATE_TRUNC('day', ${eventTable.createdAt})::DATE`,
        value: count(),
      })
      .from(eventTable)
      .where(customEventFilter)
      .groupBy(sql`DATE_TRUNC('day', ${eventTable.createdAt})::DATE`)
      .orderBy(sql`DATE_TRUNC('day', ${eventTable.createdAt})::DATE`),

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
      views: viewsSeries.map((d) => ({ date: d.date, value: d.value })),
      visitors: visitorsSeries.map((d) => ({ date: d.date, value: d.value })),
      events: eventsSeries.map((d) => ({ date: d.date, value: d.value })),
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

// Date range helpers
function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export default async function SiteAnalyticsPage({ params }: PageProps) {
  const { id } = await params;

  // Auth check
  const h = await headers();
  const reqHeaders = new Headers(h);
  const session = await getSessionFromRequest({ headers: reqHeaders } as never);
  if (!session?.user) return null;

  // Load site
  const [siteData] = await db
    .select()
    .from(siteTable)
    .where(and(eq(siteTable.id, id), eq(siteTable.userId, session.user.id)))
    .limit(1);

  if (!siteData) notFound();

  const { start, end } = getDateRange(30);
  const data = await getAnalyticsData(siteData.id, start, end);

  return (
    <div className="flex flex-col w-full h-full relative">
      <SiteOverviewWrapper initialData={data} />
    </div>
  );
}
