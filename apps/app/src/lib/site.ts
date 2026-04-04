import { db } from "@mehtrics/db";
import { site } from "@mehtrics/db/schema";
import { eq } from "@mehtrics/db/drizzle";
import { ANALYTICS_CONFIG } from "@mehtrics/worker";

/**
 * In-memory cache for site validation.
 * Avoids hitting DB on every request for site validation.
 * A siteId that exists won't be deleted that often.
 */
const siteCache = new Map<string, { valid: boolean; ts: number }>();
const { SITE_CACHE_TTL } = ANALYTICS_CONFIG;

export async function isSiteValid(siteId: string): Promise<boolean> {
  const cached = siteCache.get(siteId);
  if (cached && Date.now() - cached.ts < SITE_CACHE_TTL) {
    return cached.valid;
  }

  const [siteResult] = await db
    .select({ id: site.id })
    .from(site)
    .where(eq(site.id, siteId))
    .limit(1);

  const valid = Boolean(siteResult);
  siteCache.set(siteId, { valid, ts: Date.now() });
  return valid;
}
