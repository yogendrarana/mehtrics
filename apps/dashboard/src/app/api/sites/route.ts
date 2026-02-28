import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, sites, eq } from "@mehtrics/db";
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

// GET /api/sites — List user's sites
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userSites = await db
    .select()
    .from(sites)
    .where(eq(sites.userId, session.user.id))
    .orderBy(sites.createdAt);

  return NextResponse.json({ sites: userSites });
}

// POST /api/sites — Create a site
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
    .select({ id: sites.id })
    .from(sites)
    .where(eq(sites.domain, domain))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "A site with this domain already exists." },
      { status: 409 },
    );
  }

  const [site] = await db
    .insert(sites)
    .values({ name, domain, timezone, userId: session.user.id })
    .returning();

  return NextResponse.json({ site }, { status: 201 });
}
