import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { getSessionFromRequest } from "@mehtrics/auth";
import { db, site, eq } from "@mehtrics/db";
import { Button } from "@mehtrics/ui";
import { Badge } from "@mehtrics/ui";

async function getSiteList(userId: string) {
  return db.select().from(site).where(eq(site.userId, userId)).orderBy(site.createdAt);
}

export default async function HomePage() {
  const h = await headers();
  const reqHeaders = new Headers(h);
  const session = await getSessionFromRequest({ headers: reqHeaders } as never);

  if (!session?.user) {
    redirect("/login");
  }

  const userSiteList = await getSiteList(session.user.id);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Mehtrics</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
            <form action="/api/auth/sign-out" method="POST">
              <Button type="submit" variant="ghost" size="sm">Sign out</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Sites</h2>
          <Link href="/site/new">
            <Button size="sm">Add Site</Button>
          </Link>
        </div>

        {userSiteList.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-12 text-center space-y-3">
            <p className="text-muted-foreground">No sites yet.</p>
            <Link href="/site/new">
              <Button>Add your first site</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {userSiteList.map((site) => (
              <Link key={site.id} href={`/site/${site.id}`}>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="space-y-1">
                    <p className="font-medium">{site.name}</p>
                    <p className="text-sm text-muted-foreground">{site.domain}</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}