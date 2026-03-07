import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { getSessionFromRequest } from "@mehtrics/auth";
import { db, site as siteTable, eq, and } from "@mehtrics/db";
import { SectionHeader } from "@/components/section-header";
import { SiteGeneralSettings } from "@/app/dashboard/sites/[id]/settings/__components/site-general-settings";
import { SiteTrackingSettings } from "@/app/dashboard/sites/[id]/settings/__components/site-tracking-settings";
import { SiteDangerSettings } from "@/app/dashboard/sites/[id]/settings/__components/site-danger-settings";

type PageProps = { params: Promise<{ id: string }> };

export default async function SiteSettingsPage({ params }: PageProps) {
  const { id } = await params;

  // Auth check
  const h = await headers();
  const reqHeaders = new Headers(h);
  const session = await getSessionFromRequest({ headers: reqHeaders } as never);
  if (!session?.user) return null;

  // Load site (ownership check)
  const [siteData] = await db
    .select()
    .from(siteTable)
    .where(and(eq(siteTable.id, id), eq(siteTable.userId, session.user.id)))
    .limit(1);

  if (!siteData) notFound();

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mr-6">
          <Link href="/dashboard/sites" className="hover:text-foreground">
            Sites
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/sites/${siteData.id}`}
            className="hover:text-foreground"
          >
            {siteData.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">Settings</span>
        </div>
      </div>

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
          <SiteTrackingSettings site={siteData} />
        </div>

        <div className="p-4">
          <SiteDangerSettings site={siteData} />
        </div>
      </div>
    </div>
  );
}
