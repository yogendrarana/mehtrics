import { headers } from "next/headers";
import Link from "next/link";
import { Plus } from "lucide-react";

import { db, site, eq } from "@mehtrics/db";
import { Button } from "@mehtrics/ui/button";
import { getSessionFromRequest } from "@mehtrics/auth";
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
    <div className="flex flex-col p-4 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sites</h1>
          <p className="text-muted-foreground">Manage your analytics sites.</p>
        </div>

        <Link href="/dashboard/sites/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Site
          </Button>
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center space-y-3">
          <p className="text-muted-foreground">No sites yet.</p>
          <Link href="/dashboard/sites/new">
            <Button>Add your first site</Button>
          </Link>
        </div>
      ) : (
        <SitesTable data={data} />
      )}
    </div>
  );
}
