import { notFound } from "next/navigation";
import { getUserId } from "@/lib/auth";
import { db } from "@mehtrics/db";
import { eq, and } from "@mehtrics/db/drizzle";
import { site as siteTable } from "@mehtrics/db/schema";
import { SectionHeader } from "@/components/section-header";
import { SiteGeneralSettings } from "@/app/dashboard/sites/[id]/settings/__components/site-general-settings";
import { SiteDangerSettings } from "@/app/dashboard/sites/[id]/settings/__components/site-danger-settings";

type PageProps = { params: Promise<{ id: string }> };

export default async function SiteSettingsPage({ params }: PageProps) {
  const { id } = await params;

  // Auth check
  const userId = await getUserId();
  if (!userId) return null;

  // Load site (ownership check)
  const [siteData] = await db
    .select()
    .from(siteTable)
    .where(and(eq(siteTable.id, id), eq(siteTable.userId, userId)))
    .limit(1);

  if (!siteData) notFound();

  return (
    <div className="flex flex-col min-h-full">
      <SectionHeader
        title="Site Settings"
        subtitle="Manage your site configuration and tracking."
        className="sticky top-0 z-10"
      />

      <div className="divide-y">
        <div className="p-4">
          <SiteGeneralSettings site={siteData} />
        </div>

        <div className="p-4">
          <SiteDangerSettings site={siteData} />
        </div>
      </div>
    </div>
  );
}
