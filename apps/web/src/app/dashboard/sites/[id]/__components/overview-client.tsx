"use client";

import * as React from "react";
import { Globe, Monitor } from "lucide-react";
import { AnalyticsChart } from "./analytics-chart";
import { TopListCard } from "../../../__components/top-list-card";
import { DateRangePicker } from "./date-range-picker";
import { SectionHeader } from "@/components/section-header";

interface StatItem {
  id: string;
  label: string;
  value: string | number;
  change?: number;
}

interface OverviewClientProps {
  initialData: {
    totals: {
      pageviews: number;
      visitors: number;
    };
    chartData: { date: string; value: number }[];
    breakdowns: {
      pages: { label: string; value: number }[];
      referrers: { label: string; value: number }[];
      countries: { label: string; value: number }[];
      devices: { label: string; value: number }[];
      browsers: { label: string; value: number }[];
      os: { label: string; value: number }[];
    };
  };
}

export function OverviewClient({ initialData }: OverviewClientProps) {
  const [activeMetric, setActiveMetric] = React.useState("visitors");

  const stats = [
    {
      id: "visitors",
      label: "Visitors",
      value: initialData.totals.visitors.toLocaleString(),
    },
    {
      id: "views",
      label: "Page Views",
      value: initialData.totals.pageviews.toLocaleString(),
    },
    {
      id: "bounce",
      label: "Bounce Rate",
      value: "0%", // TODO: Implement real logic
    },
    {
      id: "duration",
      label: "Avg. Visit Time",
      value: "0s", // TODO: Implement real logic
    },
  ];

  return (
    <div className="flex flex-col flex-1 bg-white relative">
      <SectionHeader
        title="Analytics"
        subtitle="Detailed analytics for your site over the selected period."
        className="px-6 py-4 sticky top-0 z-10"
      >
        <DateRangePicker />
      </SectionHeader>

      <div className="p-4 space-y-4">
        {/* Main Chart with Tabs */}
        <AnalyticsChart
          data={initialData.chartData}
          stats={stats}
          activeTab={activeMetric}
          onTabChange={setActiveMetric}
          title={stats.find((s) => s.id === activeMetric)?.label || "Metric"}
        />

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TopListCard title="Top Pages" items={initialData.breakdowns.pages} />
          <TopListCard
            title="Top Referrers"
            items={initialData.breakdowns.referrers}
          />
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
        </div>
      </div>
    </div>
  );
}
