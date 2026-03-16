"use client";

import {
  CartesianGrid,
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "@mehtrics/ui/chart";
import { cn } from "@mehtrics/utils/cn";

export type ChartPoint = {
  date: string;
  value: number;
};

export type StatTab = {
  id: string;
  label: string;
  value: string | number;
  change?: number;
};

type AnalyticsChartProps = {
  data: ChartPoint[];
  title: string;
  description?: string;
  stats: StatTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
};

export function AnalyticsChart({
  data,
  title,
  description,
  stats,
  activeTab,
  onTabChange,
}: AnalyticsChartProps) {
  const chartConfig = {
    value: {
      label: title,
      color: "var(--chart-1, #3b82f6)",
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full overflow-hidden rounded-sm border bg-card text-card-foreground shadow-xs">
      <div className="flex w-full overflow-x-auto border-b no-scrollbar">
        {stats.map((stat) => (
          <button
            key={stat.id}
            data-active={activeTab === stat.id}
            className="min-w-37.5 cursor-pointer flex flex-col justify-center gap-1 border-r px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:px-8 sm:py-6 hover:bg-muted/30 transition-colors"
            onClick={() => onTabChange(stat.id)}
            type="button"
          >
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {stat.label}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-lg leading-none font-bold sm:text-xl">
                {stat.value}
              </span>

              {stat.change !== undefined ? (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap",
                    stat.change > 0
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
                  )}
                >
                  {stat.change > 0 ? "+" : ""}
                  {stat.change}%
                </span>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      <div className="p-6 px-2 sm:p-6">
        <div className="sr-only">{description}</div>
        {!data || data.length === 0 ? (
          <div className="flex aspect-auto h-72 w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed text-muted-foreground">
            <span className="text-sm">No data available for this period</span>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-72 w-full min-w-0"
          >
            <LineChart
              accessibilityLayer
              data={data ?? []}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <YAxis hide domain={["auto", "auto"]} />
              <XAxis
                type="category"
                dataKey="date"
                tickLine={false}
                axisLine
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-37.5"
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                }
              />
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-value, #3b82f6)"
                strokeWidth={2}
                dot={data.length === 1 ? { r: 4, strokeWidth: 2 } : false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
