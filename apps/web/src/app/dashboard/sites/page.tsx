import { getUserId } from "@/lib/auth";
import { db } from "@mehtrics/db";
import { site } from "@mehtrics/db/schema";
import { eq } from "@mehtrics/db/drizzle";
import { SitesView } from "./__components/sites-view";

async function getSiteList(userId: string) {
  const sites = await db
    .select()
    .from(site)
    .where(eq(site.userId, userId))
    .orderBy(site.createdAt);

  return sites;
}

export default async function SitesPage() {
  const userId = await getUserId();

  if (!userId) return null;

  const data = await getSiteList(userId);

  return (
    <div className="flex flex-col min-h-full">
      <SitesView data={data} />
    </div>
  );
}
