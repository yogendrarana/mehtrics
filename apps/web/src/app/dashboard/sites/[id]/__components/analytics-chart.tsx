"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@mehtrics/ui/chart";
import { cn } from "@mehtrics/utils/cn";

interface ChartData {
  date: string;
  value: number;
}

interface StatItem {
  id: string;
  label: string;
  value: string | number;
  change?: number;
}

interface AnalyticsChartProps {
  data: ChartData[];
  title: string;
  description?: string;
  stats: StatItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

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
    <div className="py-4 sm:py-0 w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
      <div className="flex flex-col border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 sm:py-6">
          <div className="font-semibold leading-none tracking-tight text-xl">
            {title}
          </div>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>

        <div className="flex overflow-x-auto no-scrollbar">
          {stats.map((stat) => (
            <button
              key={stat.id}
              data-active={activeTab === stat.id}
              className="min-w-[140px] px-6 py-4 cursor-pointer flex flex-1 flex-col justify-center gap-1 border-t text-left sm:border-t-0 sm:border-l data-[active=true]:bg-muted/50 sm:px-8 sm:py-6 hover:bg-muted/30 transition-colors"
              onClick={() => onTabChange(stat.id)}
            >
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {stat.label}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {stat.value}
                </span>

                {stat.change !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap",
                      (stat.id === "bounce" ? stat.change < 0 : stat.change > 0)
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
                    )}
                  >
                    {stat.change > 0 ? "+" : ""}
                    {stat.change}%
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
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
                  className="w-[150px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Line
              dataKey="value"
              type="monotone"
              stroke={`var(--color-value)`}
              strokeWidth={2}
              dot={data.length === 1 ? { r: 4, strokeWidth: 2 } : false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
