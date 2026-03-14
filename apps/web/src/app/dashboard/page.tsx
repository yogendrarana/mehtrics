import { headers } from "next/headers";
import Link from "next/link";
import { getSessionFromRequest } from "@mehtrics/auth";

import { db } from "@mehtrics/db";
import { site as siteTable, event as eventTable } from "@mehtrics/db/schema";
import { eq, and, gte, lt, count, sql, desc } from "@mehtrics/db/drizzle";
import { Button } from "@mehtrics/ui/button";
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

  const [[pvResult], [uvResult], topPages, topReferrers] = await Promise.all([
    // Total pageviews across all sites
    db
      .select({ value: count() })
      .from(eventTable)
      .innerJoin(siteTable, eq(eventTable.siteId, siteTable.id))
      .where(filter),

    // Total unique visitors across all sites
    db
      .select({ value: sql<number>`COUNT(DISTINCT ${eventTable.visitorHash})` })
      .from(eventTable)
      .innerJoin(siteTable, eq(eventTable.siteId, siteTable.id))
      .where(filter),

    // Top 10 pages across all sites
    db
      .select({
        pathname: eventTable.pathname,
        domain: siteTable.domain,
        views: count(),
      })
      .from(eventTable)
      .innerJoin(siteTable, eq(eventTable.siteId, siteTable.id))
      .where(filter)
      .groupBy(eventTable.pathname, siteTable.domain)
      .orderBy(desc(count()))
      .limit(10),

    // Top 10 referrers across all sites
    db
      .select({ referrer: eventTable.referrer, visits: count() })
      .from(eventTable)
      .innerJoin(siteTable, eq(eventTable.siteId, siteTable.id))
      .where(and(filter, sql`${eventTable.referrer} IS NOT NULL`))
      .groupBy(eventTable.referrer)
      .orderBy(desc(count()))
      .limit(10),
  ]);

  return {
    pageviews: pvResult?.value ?? 0,
    uniqueVisitors: uvResult?.value ?? 0,
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
          {/* Placeholder cards for other global metrics */}
          <StatCard label="Active Sites" value={"..."} />
          <StatCard label="Avg. Duration" value={"--"} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-sm text-muted-foreground">
              Top Pages (All Sites)
            </h2>
            <div className="border border-border rounded-sm overflow-hidden bg-card">
              {stats.topPages.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Page</th>
                      <th className="text-right px-4 py-2 font-medium">Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topPages.map((p, i) => (
                      <tr
                        key={i}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-2 truncate max-w-[200px] text-xs">
                          <span className="text-muted-foreground block">
                            {p.domain}
                          </span>
                          <span className="font-mono">{p.pathname ?? "/"}</span>
                        </td>
                        <td className="px-4 py-2 text-right">{p.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm text-muted-foreground">
              Top Referrers (All Sites)
            </h2>
            <div className="border border-border rounded-sm overflow-hidden bg-card">
              {stats.topReferrers.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  No referrer data yet.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">
                        Referrer
                      </th>
                      <th className="text-right px-4 py-2 font-medium">Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topReferrers.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-2 truncate max-w-[200px] text-xs">
                          {r.referrer ?? "Direct"}
                        </td>
                        <td className="px-4 py-2 text-right">{r.visits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
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
      <p className="text-xs text-muted-foreground">
        {label}
      </p>
      <p className={`text-2xl font-bold ${mono ? "font-mono text-base" : ""}`}>
        {value}
      </p>
    </div>
  );
}
