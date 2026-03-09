import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, site, eq, and } from "@mehtrics/db";
import { getSessionFromRequest } from "@mehtrics/auth";

// GET /api/site/[id] — Get single site details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSessionFromRequest(request);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [siteData] = await db
    .select()
    .from(site)
    .where(and(eq(site.id, id), eq(site.userId, session.user.id)))
    .limit(1);

  if (!siteData) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json({ site: siteData });
}

const updateSiteSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  domain: z
    .string()
    .min(1)
    .max(255)
    .transform((d) =>
      d
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "")
        .toLowerCase(),
    )
    .optional(),
  timezone: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSessionFromRequest(request);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = updateSiteSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  // Check ownership
  const [existingSite] = await db
    .select()
    .from(site)
    .where(and(eq(site.id, id), eq(site.userId, session.user.id)))
    .limit(1);

  if (!existingSite) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const updated = await db
    .update(site)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(site.id, id))
    .returning();

  return NextResponse.json({ site: updated[0] });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSessionFromRequest(request);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check ownership
  const [existingSite] = await db
    .select()
    .from(site)
    .where(and(eq(site.id, id), eq(site.userId, session.user.id)))
    .limit(1);

  if (!existingSite) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  await db.delete(site).where(eq(site.id, id));

  return NextResponse.json({ success: true });
}
