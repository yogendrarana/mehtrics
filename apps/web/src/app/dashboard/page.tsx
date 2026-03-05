import { headers } from "next/headers";
import Link from "next/link";

import { db, site, eq } from "@mehtrics/db";
import { Button, Badge } from "@mehtrics/ui";
import { getSessionFromRequest } from "@mehtrics/auth";

async function getSiteList(userId: string) {
  return db
    .select()
    .from(site)
    .where(eq(site.userId, userId))
    .orderBy(site.createdAt);
}

export default async function DashboardPage() {
  const h = await headers();
  const reqHeaders = new Headers(h);
  const session = await getSessionFromRequest({ headers: reqHeaders } as never);

  // Session is guaranteed by the dashboard layout, but TS needs this
  if (!session?.user) return null;

  const userSiteList = await getSiteList(session.user.id);

  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your analytics sites.</p>
        </div>
        <Link href="/dashboard/site/new">
          <Button>Add Site</Button>
        </Link>
      </div>

      {userSiteList.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center space-y-3">
          <p className="text-muted-foreground">No sites yet.</p>
          <Link href="/dashboard/site/new">
            <Button>Add your first site</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {userSiteList.map((s) => (
            <Link key={s.id} href={`/dashboard/site/${s.id}`}>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer">
                <div className="space-y-1">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.domain}</p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
