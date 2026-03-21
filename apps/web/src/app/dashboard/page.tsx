import Link from "next/link";
import { getUserId } from "@/lib/auth";

import { SectionHeader } from "@/components/section-header";
import { TopListCard } from "@/components/dashboard/top-list-card";

import { db } from "@mehtrics/db";
import { Button } from "@mehtrics/ui/button";
import { and, count, desc, eq, gte, lt, sql } from "@mehtrics/db/drizzle";
import { event as eventTable, site as siteTable } from "@mehtrics/db/schema";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { parseSearchParams } from "@/lib/analytics-utils";

async function getGlobalStats(userId: string, start: Date, end: Date) {
  // We need to join events with sites to filter by userId
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
  ] = await Promise.all([
    // Total pageviews across all sites
    db
      .select({ value: count() })
      .from(eventTable)
      .innerJoin(siteTable, eq(eventTable.siteId, siteTable.id))
      .where(and(filter, eq(eventTable.type, "pageview"))),

    // Total unique visitors across all sites
    db
      .select({ value: sql<number>`COUNT(DISTINCT ${eventTable.visitorHash})` })
      .from(eventTable)
      .innerJoin(siteTable, eq(eventTable.siteId, siteTable.id))
      .where(filter),

    // Total custom events across all sites
    db
      .select({ value: count() })
      .from(eventTable)
      .innerJoin(siteTable, eq(eventTable.siteId, siteTable.id))
      .where(and(filter, eq(eventTable.type, "custom"))),

    // Active sites
    db
      .select({ value: count() })
      .from(siteTable)
      .where(eq(siteTable.userId, userId)),

    // Top 10 pages across all sites
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

    // Top 10 referrers across all sites
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
  ]);

  return {
    pageviews: pvResult?.value ?? 0,
    uniqueVisitors: uvResult?.value ?? 0,
    events: evResult?.value ?? 0,
    activeSites: siteCount?.value ?? 0,
    topPages,
    topReferrers,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const userId = await getUserId();

  if (!userId) return null;

  const sParams = await searchParams;
  const { from, to } = parseSearchParams(sParams);
  const stats = await getGlobalStats(userId, from, to);

  return (
    <div className="flex flex-col min-h-full">
      <SectionHeader
        title="Global Overview"
        subtitle="Aggregated analytics across all your sites."
      >
        <DateRangePicker />
      </SectionHeader>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Pageviews"
            value={stats.pageviews.toLocaleString()}
          />
          <StatCard
            label="Total Visitors"
            value={stats.uniqueVisitors.toLocaleString()}
          />
          <StatCard
            label="Custom Events"
            value={stats.events.toLocaleString()}
          />
          <StatCard
            label="Active Sites"
            value={stats.activeSites.toLocaleString()}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <TopListCard
            title="Top Pages (All Sites)"
            items={stats.topPages.map((p) => ({
              label: `${p.domain}${p.pathname ?? "/"}`,
              value: p.views,
            }))}
            limit={6}
          />

          <TopListCard
            title="Top Referrers (All Sites)"
            items={stats.topReferrers.map((r) => ({
              label: r.referrer ?? "Direct",
              value: r.visits,
            }))}
            limit={6}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="border border-border rounded-sm p-4 bg-card space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${mono ? "font-mono text-base" : ""}`}>
        {value}
      </p>
    </div>
  );
}
