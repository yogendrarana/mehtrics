"use client";

import * as React from "react";
import { parseAsIsoDate, parseAsString, useQueryStates } from "nuqs";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDays,
  format,
  isAfter,
  isToday,
  startOfDay,
  subDays,
} from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@mehtrics/ui/button";
import { Calendar } from "@mehtrics/ui/calendar";
import { Popover, PopoverPopup, PopoverTrigger } from "@mehtrics/ui/popover";
const PERIOD_LABELS: Record<string, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "24h": "Last 24h",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@mehtrics/ui/menu";
import { cn } from "@mehtrics/utils/cn";

export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [query, setQuery] = useQueryStates(
    {
      from: parseAsIsoDate,
      to: parseAsIsoDate,
      period: parseAsString.withDefault("7d"),
    },
    {
      clearOnDefault: false,
      shallow: false,
    },
  );

  const date = React.useMemo(() => {
    return {
      from: query.from || undefined,
      to: query.to || undefined,
    } satisfies DateRange;
  }, [query.from, query.to]);

  const [month, setMonth] = React.useState(date.from || new Date());

  const showCustom = !!(query.from && query.to);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Calendar Popover */}
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>
          <CalendarIcon className="h-3.5 w-3.5" />
          {showCustom && (
            <span className="font-medium">
              {format(query.from!, "MMM dd")} - {format(query.to!, "MMM dd, y")}
            </span>
          )}
        </PopoverTrigger>
        <PopoverPopup align="end" className="p-0">
          <div className="flex flex-col border rounded-lg overflow-hidden bg-popover">
            <Calendar
              className="max-sm:pb-3 sm:ps-2"
              mode="range"
              month={month}
              onMonthChange={setMonth}
              selected={date}
              onSelect={(range) => {
                void setQuery({
                  from: range?.from || null,
                  to: range?.to || null,
                  period: null,
                });
              }}
            />
          </div>
        </PopoverPopup>
      </Popover>

      {/* Range Selection Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="h-8 text-xs px-3 min-w-32 justify-between"
            />
          }
        >
          {showCustom
            ? "Custom Range"
            : PERIOD_LABELS[query.period || "7d"] || query.period}
          <ChevronRight className="ml-2 h-3 w-3 rotate-90 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          {Object.entries(PERIOD_LABELS).map(([value, label]) => (
            <DropdownMenuItem
              key={value}
              onClick={() =>
                void setQuery({ period: value, from: null, to: null })
              }
              className="text-xs"
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
