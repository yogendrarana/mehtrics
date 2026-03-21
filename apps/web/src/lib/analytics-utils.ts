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
  const matchFormat = granularity === "day" ? "yyyy-MM-dd" : "yyyy-MM-dd HH";

  const interval =
    granularity === "day"
      ? eachDayOfInterval({ start, end })
      : eachHourOfInterval({ start, end });

  // lookup map
  const map = new Map<string, number>();

  series.forEach((s) => {
    const sDate = s.date instanceof Date ? s.date : new Date(s.date);
    const key = format(sDate, matchFormat);

    // If duplicates should sum:
    map.set(key, (map.get(key) ?? 0) + s.value);
  });

  const data = interval.map((d) => {
    const key = format(d, matchFormat);

    return {
      date: format(d, formatStr),
      value: map.get(key) ?? 0,
    };
  });

  return data;
}

export function parseSearchParams(
  searchParams: Record<string, string | Array<string> | undefined>,
) {
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
