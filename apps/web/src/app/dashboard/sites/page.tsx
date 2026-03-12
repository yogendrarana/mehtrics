import { headers } from "next/headers";
import Link from "next/link";
import { Plus } from "lucide-react";

import { db, site, eq } from "@mehtrics/db";
import { Button } from "@mehtrics/ui/button";
import { getSessionFromRequest } from "@mehtrics/auth";
import { SectionHeader } from "@/components/section-header";
import { SitesTable } from "./__components/sites-table";

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
      <SectionHeader title="Sites" subtitle="Manage your analytics sites." />

      <div className="p-4 space-y-4">
        {data.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl py-20 text-center space-y-3">
            <p className="text-muted-foreground">No sites yet.</p>
            <Link href="/dashboard/sites/new">
              <Button>Add your first site</Button>
            </Link>
          </div>
        ) : (
          <SitesTable data={data} />
        )}
      </div>
    </div>
  );
}
