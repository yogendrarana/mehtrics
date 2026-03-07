import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { getSessionFromRequest } from "@mehtrics/auth";
import {
  db,
  site as siteTable,
  event as eventTable,
  eq,
  and,
  gte,
  lt,
  count,
  sql,
  desc,
} from "@mehtrics/db";
import { Button } from "@mehtrics/ui/button";
import { Settings } from "lucide-react";
import { SectionHeader } from "@/components/section-header";

type PageProps = { params: Promise<{ id: string }> };

// Date range helpers
function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

async function getOverviewStats(siteId: string, start: Date, end: Date) {
  const filter = and(
    eq(eventTable.siteId, siteId),
    gte(eventTable.createdAt, start),
    lt(eventTable.createdAt, end),
  );

  // Parallel queries
  const [[pvResult], [uvResult], topPages, topReferrers] = await Promise.all([
    // Total pageviews
    db
      .select({ value: count() })
      .from(eventTable)
      .where(filter),

    // Unique visitors
    db
      .select({ value: sql<number>`COUNT(DISTINCT ${eventTable.visitorHash})` })
      .from(eventTable)
      .where(filter),

    // Top 10 pages
    db
      .select({ pathname: eventTable.pathname, views: count() })
      .from(eventTable)
      .where(filter)
      .groupBy(eventTable.pathname)
      .orderBy(desc(count()))
      .limit(10),

    // Top 10 referrers
    db
      .select({ referrer: eventTable.referrer, visits: count() })
      .from(eventTable)
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
  const stats = await getOverviewStats(siteData.id, start, end);

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mr-6">
          <Link href="/dashboard/sites" className="hover:text-foreground">
            Sites
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">{siteData.name}</span>
        </div>

        <Link href={`/dashboard/sites/${siteData.id}/settings`}>
          <Button variant="outline" size="sm" className="bg-background">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </Link>
      </div>

      <SectionHeader
        title={siteData.name}
        subtitle={siteData.domain}
        className="sticky top-0 z-10"
      />

      <div className="flex-1 divide-y">
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Pageviews (30d)"
              value={stats.pageviews.toLocaleString()}
            />
            <StatCard
              label="Unique Visitors (30d)"
              value={stats.uniqueVisitors.toLocaleString()}
            />
            <StatCard
              label="Site ID"
              value={siteData.id.slice(0, 8) + "…"}
              mono
            />
            <StatCard label="Timezone" value={siteData.timezone} />
          </div>
        </div>

        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="font-semibold text-sm uppercase text-muted-foreground">
                Top Pages
              </h2>
              <div className="border rounded-md overflow-hidden bg-card">
                {stats.topPages.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    No data yet.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium">
                          Page
                        </th>
                        <th className="text-right px-4 py-2 font-medium">
                          Views
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topPages.map((p, i) => (
                        <tr
                          key={i}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-2 truncate max-w-[200px] font-mono text-xs">
                            {p.pathname ?? "/"}
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
              <h2 className="font-semibold text-sm uppercase text-muted-foreground">
                Top Referrers
              </h2>
              <div className="border rounded-md overflow-hidden bg-card">
                {stats.topReferrers.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    No referrer data yet.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium">
                          Referrer
                        </th>
                        <th className="text-right px-4 py-2 font-medium">
                          Visits
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topReferrers.map((r, i) => (
                        <tr
                          key={i}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
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
    </div>
  );
}

function StatCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border rounded-md p-4 bg-card shadow-xs space-y-1">
      <p className="text-xs text-muted-foreground uppercase font-medium">
        {label}
      </p>
      <p className={`text-2xl font-bold ${mono ? "font-mono text-base" : ""}`}>
        {value}
      </p>
    </div>
  );
}
