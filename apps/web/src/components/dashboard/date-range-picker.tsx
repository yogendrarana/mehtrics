"use client";

import { Button } from "@mehtrics/ui/button";
import { Calendar } from "@mehtrics/ui/calendar";
import { Popover, PopoverPopup, PopoverTrigger } from "@mehtrics/ui/popover";
import { cn } from "@mehtrics/utils/cn";
import { addDays, format, isAfter, isToday, subDays } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [month, setMonth] = React.useState(date?.from || new Date());

  const handlePrevDay = () => {
    if (!date?.from || !date?.to) return;
    setDate({
      from: subDays(date.from, 1),
      to: subDays(date.to, 1),
    });
  };

  const handleNextDay = () => {
    if (!date?.from || !date?.to) return;
    const nextTo = addDays(date.to, 1);
    if (isAfter(nextTo, new Date()) && !isToday(nextTo)) return;

    setDate({
      from: addDays(date.from, 1),
      to: nextTo,
    });
  };

  const isFutureDisabled = React.useMemo(() => {
    if (!date?.to) return true;
    return isToday(date.to) || isAfter(date.to, new Date());
  }, [date?.to]);

  const selectRange = (days: number) => {
    const newFrom = subDays(new Date(), days);
    setDate({
      from: newFrom,
      to: new Date(),
    });
    setMonth(newFrom);
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevDay}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger
          render={
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-60 h-8 justify-start text-left font-normal text-xs",
                !date && "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </PopoverTrigger>

        <PopoverPopup align="end">
          <div className="flex max-sm:flex-col p-2">
            <div className="relative py-1 ps-1 max-sm:order-1 max-sm:border-t">
              <div className="flex h-full flex-col sm:border-e sm:pe-3 gap-1">
                <Button
                  className="w-full justify-start text-xs h-8"
                  onClick={() => selectRange(0)}
                  variant="ghost"
                >
                  Today
                </Button>
                <Button
                  className="w-full justify-start text-xs h-8"
                  onClick={() => selectRange(1)}
                  variant="ghost"
                >
                  Yesterday
                </Button>
                <Button
                  className="w-full justify-start text-xs h-8"
                  onClick={() => selectRange(7)}
                  variant="ghost"
                >
                  Last 7 days
                </Button>
                <Button
                  className="w-full justify-start text-xs h-8"
                  onClick={() => selectRange(30)}
                  variant="ghost"
                >
                  Last 30 days
                </Button>
                <Button
                  className="w-full justify-start text-xs h-8"
                  onClick={() => selectRange(90)}
                  variant="ghost"
                >
                  Last 90 days
                </Button>
              </div>
            </div>

            <Calendar
              className="max-sm:pb-3 sm:ps-2"
              mode="range"
              month={month}
              onMonthChange={setMonth}
              selected={date}
              onSelect={setDate}
            />
          </div>
        </PopoverPopup>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextDay}
        disabled={isFutureDisabled}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
