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

  // Auth — guaranteed by dashboard layout, but we need session for ownership check
  const h = await headers();
  const reqHeaders = new Headers(h);
  const session = await getSessionFromRequest({ headers: reqHeaders } as never);
  if (!session?.user) return null;

  // Load site (ownership check)
  const [siteData] = await db
    .select()
    .from(siteTable)
    .where(and(eq(siteTable.id, id), eq(siteTable.userId, session.user.id)))
    .limit(1);

  if (!siteData) notFound();

  const { start, end } = getDateRange(30);
  const stats = await getOverviewStats(siteData.id, start, end);

  const trackingSnippet = `<script src="${process.env["NEXT_PUBLIC_APP_URL"] ?? ""}/api/script.js" data-site-id="${siteData.id}" async></script>`;

  return (
    <div className="flex flex-col space-y-8 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{siteData.domain}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{siteData.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Pageviews (30d)"
          value={stats.pageviews.toLocaleString()}
        />
        <StatCard
          label="Unique Visitors (30d)"
          value={stats.uniqueVisitors.toLocaleString()}
        />
        <StatCard label="Site ID" value={siteData.id.slice(0, 8) + "…"} mono />
        <StatCard label="Timezone" value={siteData.timezone} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Top Pages
          </h2>
          <div className="border border-border rounded-xl overflow-hidden bg-card">
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
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Top Referrers
          </h2>
          <div className="border border-border rounded-xl overflow-hidden bg-card">
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

      <div className="space-y-3 pt-6 border-t border-border">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          Tracking Snippet
        </h2>
        <div className="border border-border rounded-xl p-4 bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">
            Add this snippet to your site&apos;s{" "}
            <code className="font-mono bg-muted px-1 rounded">
              &lt;head&gt;
            </code>
            :
          </p>
          <pre className="font-mono text-xs bg-background border border-border rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
            {trackingSnippet}
          </pre>
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
    <div className="border border-border rounded-xl p-4 bg-card space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-2xl font-bold ${mono ? "font-mono text-base" : ""}`}>
        {value}
      </p>
    </div>
  );
}
