import { getUserId } from "@/lib/auth";
import { getSiteOrThrow } from "@/services/site";
import { getAnalyticsData } from "@/services/analytics";
import { notFound } from "next/navigation";
import { SiteOverviewWrapper } from "./__components/site-overview-wrapper";
import { parseSearchParams } from "@/lib/analytics-utils";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SiteAnalyticsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sParams = await searchParams;

  // Auth check
  const userId = await getUserId();
  if (!userId) return null;

  // Load site with ownership check via service
  let siteData;
  try {
    siteData = await getSiteOrThrow(id, userId);
  } catch {
    notFound();
  }

  const { from, to } = parseSearchParams(sParams);
  const data = await getAnalyticsData(siteData.id, from, to);

  return (
    <div className="flex flex-col w-full h-full relative">
      <SiteOverviewWrapper initialData={data} />
    </div>
  );
}
