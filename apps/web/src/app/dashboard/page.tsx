import { getUserId } from "@/lib/auth";
import { SectionHeader } from "@/components/section-header";
import { TopListCard } from "@/components/dashboard/top-list-card";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { parseSearchParams } from "@/lib/analytics-utils";
import { getGlobalStats } from "@/lib/services/analytics";

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
