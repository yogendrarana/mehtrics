import { db } from "@mehtrics/db";
import { site as siteTable } from "@mehtrics/db/schema";
import { and, eq } from "@mehtrics/db/drizzle";

/**
 * Fetch a site by ID and ensure it belongs to the specified user.
 */
export async function getSiteOrThrow(id: string, userId: string) {
  const [siteData] = await db
    .select()
    .from(siteTable)
    .where(and(eq(siteTable.id, id), eq(siteTable.userId, userId)))
    .limit(1);

  if (!siteData) {
    throw new Error("Site not found");
  }

  return siteData;
}

/**
 * Fetch all sites belonging to a user.
 */
export async function getSiteList(userId: string) {
  const sites = await db
    .select()
    .from(siteTable)
    .where(eq(siteTable.userId, userId))
    .orderBy(siteTable.createdAt);

  return sites;
}
