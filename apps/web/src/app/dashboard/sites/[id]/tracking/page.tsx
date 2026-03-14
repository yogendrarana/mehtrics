import { SectionHeader } from "@/components/section-header";
import { SiteTrackingSettings } from "./_components/site-tracking-settings";
import { headers } from "next/headers";
import { getSessionFromRequest } from "@mehtrics/auth";
import { db } from "@mehtrics/db";
import { site as siteTable } from "@mehtrics/db/schema";
import { and, eq } from "@mehtrics/db/drizzle";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function TrackingScriptPage({ params }: PageProps) {
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
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Tracking Script"
        subtitle="Install this code snippet on your website to start tracking visitors."
      />

      <div className="divide-y">
        <div className="p-4">
          <SiteTrackingSettings site={siteData} />
        </div>
      </div>
    </div>
  );
}
