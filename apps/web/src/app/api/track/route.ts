import { type NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import {
  checkRateLimit,
  shouldIgnoreRequest,
  enqueueEvent,
  trackPayloadSchema,
  type QueuedEvent,
} from "@mehtrics/analytics";
import { db } from "@mehtrics/db";
import { site } from "@mehtrics/db/schema";
import { eq } from "@mehtrics/db/drizzle";
import { type TEventType } from "@mehtrics/shared/types";
import { ANALYTICS_CONFIG } from "@mehtrics/shared/constants";

/**
 * Hashes IP + UA + site to create a daily anonymous visitor ID.
 *
 * @param param0
 * @returns
 */
async function hashVisitor({
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

// URL Pathname Extraction
function extractPathname(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

function extractQuery(url: string): string | null {
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

async function isSiteValid(siteId: string): Promise<boolean> {
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

function getClientIP(request: Request): string {
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

// POST /api/track
export async function POST(request: NextRequest) {
  // 1. Parse body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 2. Validate payload
  const parsed = trackPayloadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const payload = parsed.data;

  // 3. Get IP and User-Agent
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent");

  // 4. Bot filtering
  if (shouldIgnoreRequest(userAgent)) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  // 5. Rate limiting (per IP)
  const { allowed, remaining } = await checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "Retry-After": "60",
        },
      },
    );
  }

  // 6. Validate site exists
  const siteValid = await isSiteValid(payload.siteId);
  if (!siteValid) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // 7. Parse UA for device info
  const parser = new UAParser(userAgent ?? "");
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const deviceResult = parser.getDevice();

  const deviceType = ((): QueuedEvent["device"] => {
    const type = deviceResult.type;
    if (type === "mobile") return "mobile";
    if (type === "tablet") return "tablet";
    if (!type) return "desktop"; // No device type = desktop
    return "unknown";
  })();

  // 8. Hash visitor fingerprint
  const visitorHash = await hashVisitor({
    ip,
    ua: userAgent ?? "",
    siteId: payload.siteId,
  });

  // 9. Build queued event
  const queuedEvent: QueuedEvent = {
    siteId: payload.siteId,
    type: payload.type as TEventType,
    url: payload.url,
    referrer: payload.referrer ?? null,
    pathname: extractPathname(payload.url) ?? "/",
    visitorHash,
    country: null,
    region: null,
    city: null,
    browser: browser.name ?? null,
    browserVersion: browser.version ?? null,
    os: os.name ?? null,
    device: deviceType,
    screenWidth: payload.screenWidth ?? null,
    screenHeight: payload.screenHeight ?? null,
    query: extractQuery(payload.url),
    sessionId: payload.sessionId ?? null,
    duration: payload.duration ?? null,
    eventName: payload.eventName ?? null,
    enqueuedAt: Date.now(),
  };

  // Overwrite country from Cloudflare header if available
  const cfCountry = request.headers.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX") {
    queuedEvent.country = cfCountry.toUpperCase().slice(0, 2);
  }

  const cfRegion = request.headers.get("cf-region");
  if (cfRegion) {
    queuedEvent.region = cfRegion;
  }

  const cfCity = request.headers.get("cf-ipcity");
  if (cfCity) {
    queuedEvent.city = cfCity;
  }

  // 10. Push to Redis queue
  await enqueueEvent(queuedEvent);

  const origin = request.headers.get("origin") || "*";

  return NextResponse.json(
    { ok: true },
    {
      status: 202,
      headers: {
        "X-RateLimit-Remaining": String(remaining),
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      },
    },
  );
}

// OPTIONS /api/track — CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "*";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
