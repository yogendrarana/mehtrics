import {
  eachDayOfInterval,
  eachHourOfInterval,
  format,
  differenceInHours,
  subHours,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";

export function fillSeriesGaps(
  series: { date: string | Date; value: number }[],
  start: Date,
  end: Date,
) {
  const diffHours = differenceInHours(end, start);
  const granularity = diffHours <= 24 ? "hour" : "day";

  const formatStr = granularity === "day" ? "yyyy-MM-dd" : "h:mm a";
  const interval =
    granularity === "day"
      ? eachDayOfInterval({ start, end })
      : eachHourOfInterval({ start, end });

  return interval.map((d) => {
    const formattedDate = format(d, formatStr);
    const match = series.find((s) => {
      const sDate = s.date instanceof Date ? s.date : new Date(s.date);
      // For matching accurately, we use a broader format that avoids sub-hour/sub-day noise
      const matchFormat =
        granularity === "day" ? "yyyy-MM-dd" : "yyyy-MM-dd HH";
      return format(sDate, matchFormat) === format(d, matchFormat);
    });
    return {
      date: formattedDate,
      value: match ? match.value : 0,
    };
  });
}

export function parseSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const period =
    typeof searchParams.period === "string" ? searchParams.period : null;
  const fromStr =
    typeof searchParams.from === "string" ? searchParams.from : null;
  const toStr = typeof searchParams.to === "string" ? searchParams.to : null;

  let from: Date;
  let to: Date;

  if (period === "24h") {
    to = new Date();
    from = subHours(to, 24);
  } else if (period === "today") {
    from = startOfDay(new Date());
    to = new Date();
  } else if (period === "yesterday") {
    const yest = subDays(new Date(), 1);
    from = startOfDay(yest);
    to = endOfDay(yest);
  } else if (period === "7d") {
    to = new Date();
    from = subDays(to, 6);
  } else if (period === "30d") {
    to = new Date();
    from = subDays(to, 29);
  } else if (fromStr && toStr) {
    from = new Date(fromStr);
    to = new Date(toStr);
  } else {
    // Default 7d
    to = new Date();
    from = subDays(to, 6);
  }

  // Final validation
  if (isNaN(from.getTime())) from = subDays(new Date(), 6);
  if (isNaN(to.getTime())) to = new Date();

  return { from, to };
}
