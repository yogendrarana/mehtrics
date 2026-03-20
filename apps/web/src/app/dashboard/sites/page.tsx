import { headers } from "next/headers";
import Link from "next/link";

import { db } from "@mehtrics/db";
import { site } from "@mehtrics/db/schema";
import { eq } from "@mehtrics/db/drizzle";
import { Button } from "@mehtrics/ui/button";
import { getSessionFromRequest } from "@mehtrics/auth";
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
  const h = await headers();
  const reqHeaders = new Headers(h);
  const session = await getSessionFromRequest({ headers: reqHeaders } as never);

  if (!session?.user) return null;

  const data = await getSiteList(session.user.id);

  return (
    <div className="flex flex-col min-h-full">
      <SitesView data={data} />
    </div>
  );
}
