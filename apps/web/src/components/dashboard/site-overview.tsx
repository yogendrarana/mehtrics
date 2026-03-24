"use client";

import {
  Globe,
  Monitor,
  Users,
  FileText,
  MousePointerClick,
} from "lucide-react";
import * as React from "react";
import {
  AnalyticsChart,
  type ChartPoint,
  type StatTab,
} from "@/components/dashboard/analytics-chart";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { TopListCard } from "@/components/dashboard/top-list-card";
import { SectionHeader } from "@/components/section-header";

export type SiteOverviewData = {
  totals: {
    pageviews: number;
    visitors: number;
    events?: number;
  };
  series: {
    views: ChartPoint[];
    visitors: ChartPoint[];
    events?: ChartPoint[];
  };
  breakdowns: {
    pages: { label: string; value: number }[];
    referrers: { label: string; value: number }[];
    countries: { label: string; value: number }[];
    devices: { label: string; value: number }[];
    browsers: { label: string; value: number }[];
    os: { label: string; value: number }[];
  };
};

type SiteOverviewProps = {
  initialData: SiteOverviewData;
  mode?: "page" | "embed";
  compact?: boolean;
  title?: string;
  subtitle?: string;
};

export function SiteOverview({
  initialData,
  mode = "page",
  compact = false,
  title = "Analytics",
  subtitle = "Detailed analytics for your site over the selected period.",
}: SiteOverviewProps) {
  const [activeMetric, setActiveMetric] = React.useState<
    "visitors" | "views" | "events"
  >("visitors");

  const statTabs: StatTab[] = [
    {
      id: "visitors",
      label: "Visitors",
      value: initialData.totals.visitors.toLocaleString(),
      icon: <Users className="h-3 w-3" />,
    },
    {
      id: "views",
      label: "Pageviews",
      value: initialData.totals.pageviews.toLocaleString(),
      icon: <FileText className="h-3 w-3" />,
    },
    {
      id: "events",
      label: "Events",
      value: (initialData.totals.events ?? 0).toLocaleString(),
      icon: <MousePointerClick className="h-3 w-3" />,
    },
  ];

  const chartData =
    activeMetric === "views"
      ? initialData.series.views
      : activeMetric === "events"
        ? (initialData.series.events ?? [])
        : initialData.series.visitors;

  const content = (
    <div className={mode === "page" ? "p-4 space-y-4" : "p-4 space-y-4"}>
      <AnalyticsChart
        data={chartData}
        stats={statTabs}
        activeTab={activeMetric}
        onTabChange={(id) =>
          setActiveMetric(id as "visitors" | "views" | "events")
        }
        title={statTabs.find((s) => s.id === activeMetric)?.label ?? "Metric"}
      />

      <div
        className={
          compact
            ? "grid grid-cols-1 md:grid-cols-2 gap-4"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        }
      >
        <TopListCard title="Top Pages" items={initialData.breakdowns.pages} />
        <TopListCard
          title="Top Referrers"
          items={initialData.breakdowns.referrers}
        />

        {compact ? null : (
          <>
            <TopListCard
              title="Countries"
              items={initialData.breakdowns.countries.map((c) => ({
                ...c,
                icon: <Globe className="h-3 w-3" />,
              }))}
            />
            <TopListCard
              title="Devices"
              items={initialData.breakdowns.devices.map((d) => ({
                ...d,
                icon: <Monitor className="h-3 w-3" />,
              }))}
            />
            <TopListCard
              title="Operating Systems"
              items={initialData.breakdowns.os}
            />
            <TopListCard
              title="Browsers"
              items={initialData.breakdowns.browsers}
            />
          </>
        )}
      </div>
    </div>
  );

  if (mode === "embed") {
    return (
      <div className="bg-background">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          className="px-4 py-3"
        />
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-background relative">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        className="px-6 py-4 sticky top-0 z-10 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60"
      >
        <DateRangePicker />
      </SectionHeader>
      {content}
    </div>
  );
}
