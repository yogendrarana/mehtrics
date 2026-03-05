import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, site, eq } from "@mehtrics/db";
import { getSessionFromRequest } from "@mehtrics/auth";

// ---- Schema ----
const createSiteSchema = z.object({
  name: z.string().min(1).max(255),
  domain: z
    .string()
    .min(1)
    .max(255)
    .transform((d) =>
      d
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "")
        .toLowerCase(),
    ),
  timezone: z.string().default("UTC"),
});

// GET /api/site — List user's sites
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userSiteList = await db
    .select()
    .from(site)
    .where(eq(site.userId, session.user.id))
    .orderBy(site.createdAt);

  return NextResponse.json({ site: userSiteList });
}

// POST /api/site — Create a site
export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = createSiteSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { name, domain, timezone } = parsed.data;

  // Check domain uniqueness
  const [existing] = await db
    .select({ id: site.id })
    .from(site)
    .where(eq(site.domain, domain))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "A site with this domain already exists." },
      { status: 409 },
    );
  }

  const [createdSite] = await db
    .insert(site)
    .values({ name, domain, timezone, userId: session.user.id })
    .returning();

  return NextResponse.json({ site: createdSite }, { status: 201 });
}
