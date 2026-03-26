"use client";

import {
  SiteOverview,
  type SiteOverviewData,
} from "@/components/site-overview";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";

export function SiteOverviewWrapper({
  initialData,
}: {
  initialData: SiteOverviewData;
}) {
  return (
    <SiteOverview initialData={initialData}>
      <DateRangePicker />
    </SiteOverview>
  );
}
