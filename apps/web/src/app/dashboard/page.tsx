import { getSessionFromRequest } from "@mehtrics/auth";
import { db } from "@mehtrics/db";
import { and, count, desc, eq, gte, lt, sql } from "@mehtrics/db/drizzle";
import { event as eventTable, site as siteTable } from "@mehtrics/db/schema";
import { Button } from "@mehtrics/ui/button";
import { headers } from "next/headers";
import Link from "next/link";
import { TopListCard } from "@/components/dashboard/top-list-card";
import { SectionHeader } from "@/components/section-header";

// Date range helpers
function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

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

export default async function DashboardPage() {
  const h = await headers();
  const reqHeaders = new Headers(h);
  const session = await getSessionFromRequest({ headers: reqHeaders } as never);

  if (!session?.user) return null;

  const { start, end } = getDateRange(30);
  const stats = await getGlobalStats(session.user.id, start, end);

  return (
    <div className="flex flex-col min-h-full">
      <SectionHeader
        title="Global Overview"
        subtitle="Aggregated analytics across all your sites."
      >
        <Link href="/dashboard/sites/new">
          <Button variant="default">Add Site</Button>
        </Link>
      </SectionHeader>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Pageviews (30d)"
            value={stats.pageviews.toLocaleString()}
          />
          <StatCard
            label="Total Visitors (30d)"
            value={stats.uniqueVisitors.toLocaleString()}
          />
          <StatCard
            label="Custom Events (30d)"
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
