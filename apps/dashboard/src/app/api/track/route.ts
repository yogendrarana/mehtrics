import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UAParser } from "ua-parser-js";
import { db, sites, eq } from "@mehtrics/db";
import { checkRateLimit } from "@/lib/rate-limiter";
import { shouldIgnoreRequest } from "@/lib/bot-filter";
import { enqueueEvent, type QueuedEvent } from "@/lib/event-queue";

// Request Validation Schema
const trackPayloadSchema = z.object({
  siteId: z.string().uuid("Invalid siteId"),
  type: z.enum(["pageview", "custom"]).default("pageview"),
  url: z.string().url("Invalid URL").max(2048),
  referrer: z.string().max(2048).optional().nullable(),
  screenWidth: z.number().int().positive().max(8192).optional().nullable(),
  eventName: z.string().max(255).optional().nullable(),
});

type TrackPayload = z.infer<typeof trackPayloadSchema>;

// Visitor Fingerprint Hashing
// We hash IP + UA + site to create a daily anonymous visitor ID.
// Raw IPs are NEVER stored.
async function hashVisitor(
  ip: string,
  ua: string,
  siteId: string,
): Promise<string> {
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

// Site cache (in-memory, short TTL)
// Avoid hitting DB on every request for site validation.
// A siteId that exists won't be deleted that often.
const siteCache = new Map<string, { valid: boolean; ts: number }>();
const SITE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function isSiteValid(siteId: string): Promise<boolean> {
  const cached = siteCache.get(siteId);
  if (cached && Date.now() - cached.ts < SITE_CACHE_TTL) {
    return cached.valid;
  }

  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);
  const valid = !!site;
  siteCache.set(siteId, { valid, ts: Date.now() });
  return valid;
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

  const payload: TrackPayload = parsed.data;

  // 3. Get IP and User-Agent
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "0.0.0.0";

  const userAgent = request.headers.get("user-agent");

  // 4. Bot filtering
  if (shouldIgnoreRequest(userAgent)) {
    return NextResponse.json({ ok: true }, { status: 202 }); // silently accept but discard
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
  const visitorHash = await hashVisitor(ip, userAgent ?? "", payload.siteId);

  // 9. Build queued event
  const event: QueuedEvent = {
    siteId: payload.siteId,
    type: payload.type,
    url: payload.url,
    referrer: payload.referrer ?? null,
    pathname: extractPathname(payload.url),
    visitorHash,
    country: null, // Set by worker using ip2country or Cloudflare header
    browser: browser.name ?? null,
    browserVersion: browser.version ?? null,
    os: os.name ?? null,
    device: deviceType,
    screenWidth: payload.screenWidth ?? null,
    eventName: payload.eventName ?? null,
    enqueuedAt: Date.now(),
  };

  // Overwrite country from Cloudflare header if available
  const cfCountry = request.headers.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX") {
    event.country = cfCountry.toUpperCase().slice(0, 2);
  }

  // 10. Push to Redis queue
  await enqueueEvent(event);

  return NextResponse.json(
    { ok: true },
    {
      status: 202,
      headers: {
        "X-RateLimit-Remaining": String(remaining),
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

// OPTIONS /api/track — CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
