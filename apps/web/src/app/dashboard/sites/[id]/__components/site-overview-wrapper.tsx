"use client";

import {
  SiteOverview,
  type SiteOverviewData,
} from "@/components/dashboard/site-overview";

export function SiteOverviewWrapper({
  initialData,
}: {
  initialData: SiteOverviewData;
}) {
  return <SiteOverview initialData={initialData} />;
}
