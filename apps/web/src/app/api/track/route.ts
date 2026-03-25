import { UAParser } from "ua-parser-js";
import { type NextRequest, NextResponse } from "next/server";

import { type TEventType } from "@/types";
import { checkRateLimit } from "@/lib/rate-limiter";
import { shouldIgnoreRequest } from "@/lib/bot-filter";
import { enqueueEvent, type QueuedEvent } from "@/lib/event-queue";

import {
  trackPayloadSchema,
  hashVisitor,
  hashSession,
  extractPathname,
  extractQuery,
  isSiteValid,
  getClientIP,
} from "@/lib/utils/track-utils";

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

  // 8. Hash visitor fingerprint & session
  const [visitorHash, sessionId] = await Promise.all([
    hashVisitor({
      ip,
      ua: userAgent ?? "",
      siteId: payload.siteId,
    }),
    hashSession({
      ip,
      ua: userAgent ?? "",
      siteId: payload.siteId,
    }),
  ]);

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
    sessionId,
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
