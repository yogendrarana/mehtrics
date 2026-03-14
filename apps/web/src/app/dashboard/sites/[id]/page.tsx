import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { db } from "@mehtrics/db";
import { getSessionFromRequest } from "@mehtrics/auth";
import { site as siteTable, event as eventTable } from "@mehtrics/db/schema";
import { eq, and, gte, lt, count, sql, desc } from "@mehtrics/db/drizzle";

import { OverviewClient } from "./__components/overview-client";

type PageProps = { params: Promise<{ id: string }> };

async function getAnalyticsData(siteId: string, start: Date, end: Date) {
  const filter = and(
    eq(eventTable.siteId, siteId),
    gte(eventTable.createdAt, start),
    lt(eventTable.createdAt, end),
  );

  // Run all breakdown queries in parallel
  const [
    [pvResult],
    [uvResult],
    chartData,
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
      .where(filter),
    db
      .select({ value: sql<number>`COUNT(DISTINCT ${eventTable.visitorHash})` })
      .from(eventTable)
      .where(filter),

    // Chart Data (Time series)
    db
      .select({
        date: sql<string>`DATE_TRUNC('day', ${eventTable.createdAt})::DATE`,
        value: count(),
      })
      .from(eventTable)
      .where(filter)
      .groupBy(sql`DATE_TRUNC('day', ${eventTable.createdAt})::DATE`)
      .orderBy(sql`DATE_TRUNC('day', ${eventTable.createdAt})::DATE`),

    // Top Pages
    db
      .select({ label: eventTable.pathname, value: count() })
      .from(eventTable)
      .where(filter)
      .groupBy(eventTable.pathname)
      .orderBy(desc(count()))
      .limit(10),

    // Top Referrers
    db
      .select({ label: eventTable.referrer, value: count() })
      .from(eventTable)
      .where(and(filter, sql`${eventTable.referrer} IS NOT NULL`))
      .groupBy(eventTable.referrer)
      .orderBy(desc(count()))
      .limit(10),

    // Top Countries
    db
      .select({ label: eventTable.country, value: count() })
      .from(eventTable)
      .where(and(filter, sql`${eventTable.country} IS NOT NULL`))
      .groupBy(eventTable.country)
      .orderBy(desc(count()))
      .limit(10),

    // Top Devices
    db
      .select({ label: eventTable.device, value: count() })
      .from(eventTable)
      .where(and(filter, sql`${eventTable.device} IS NOT NULL`))
      .groupBy(eventTable.device)
      .orderBy(desc(count())),

    // Top Browsers
    db
      .select({ label: eventTable.browser, value: count() })
      .from(eventTable)
      .where(and(filter, sql`${eventTable.browser} IS NOT NULL`))
      .groupBy(eventTable.browser)
      .orderBy(desc(count())),

    // Top OS
    db
      .select({ label: eventTable.os, value: count() })
      .from(eventTable)
      .where(and(filter, sql`${eventTable.os} IS NOT NULL`))
      .groupBy(eventTable.os)
      .orderBy(desc(count())),
  ]);

  return {
    totals: {
      pageviews: pvResult?.value ?? 0,
      visitors: uvResult?.value ?? 0,
    },
    chartData: chartData.map((d) => ({ date: d.date, value: d.value })),
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
      <OverviewClient initialData={data} />
    </div>
  );
}
