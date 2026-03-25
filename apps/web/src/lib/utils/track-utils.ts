import z from "zod";
import { db } from "@mehtrics/db";
import { site } from "@mehtrics/db/schema";
import { eq } from "@mehtrics/db/drizzle";
import { ANALYTICS_CONFIG } from "@/constants";

export const trackPayloadSchema = z.object({
  siteId: z.uuid("Invalid siteId"),
  type: z.enum(["pageview", "custom"]).default("pageview"),
  url: z.url("Invalid URL").max(2048),
  referrer: z.string().max(2048).optional().nullable(),
  screenWidth: z.number().int().positive().max(8192).optional().nullable(),
  screenHeight: z.number().int().positive().max(8192).optional().nullable(),
  sessionId: z.string().max(64).optional().nullable(),
  duration: z.number().int().nonnegative().optional().nullable(),
  eventName: z.string().max(255).optional().nullable(),
});

export async function hashVisitor({
  ip,
  ua,
  siteId,
}: {
  ip: string;
  ua: string;
  siteId: string;
}): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const raw = `${ip}|${ua}|${siteId}|${today}`;

  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );

  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 64);
}

/**
 * Hashes IP + UA + site + current hour to create a session ID.
 */
export async function hashSession({
  ip,
  ua,
  siteId,
}: {
  ip: string;
  ua: string;
  siteId: string;
}): Promise<string> {
  const now = new Date();
  const hourStart = new Date(now);
  hourStart.setUTCMinutes(0, 0, 0);
  const sessionTS = hourStart.toISOString();

  const raw = `${ip}|${ua}|${siteId}|${sessionTS}`;

  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );

  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 64);
}

// URL Pathname Extraction
export function extractPathname(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

export function extractQuery(url: string): string | null {
  try {
    return new URL(url).search || null;
  } catch {
    return null;
  }
}

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

export function getClientIP(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    if (first) return first.trim();
  }

  const real = request.headers.get("x-real-ip");
  if (real) return real;

  return "0.0.0.0";
}
