import * as z from "zod";
import { UAParser } from "ua-parser-js";
import { type NextRequest, NextResponse } from "next/server";

import { type TEventType } from "@/types";
import { checkRateLimit } from "@/lib/rate-limiter";
import { shouldIgnoreRequest } from "@/lib/bot-filter";
import { enqueueEvent, type QueuedEvent } from "@/lib/event-queue";

import { trackPayloadSchema } from "@/lib/schema";
import { hashVisitor, hashSession } from "@/lib/hash";
import { extractPathname, extractQuery } from "@/lib/url";
import { isSiteValid } from "@/lib/site";
import { getGeolocation } from "@/lib/geo";
import { getClientIP } from "@/lib/ip";

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
      { error: "Validation failed", details: z.treeifyError(parsed.error) },
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

  const os = parser.getOS();
  const browser = parser.getBrowser();
  const deviceResult = parser.getDevice();

  const deviceType = ((): QueuedEvent["device"] => {
    const type = deviceResult.type;
    if (type === "mobile") return "mobile";
    if (type === "tablet") return "tablet";
    if (!type) return "desktop";
    if (type === "smarttv" || type === "console") return "desktop";

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
    url: payload.url,
    device: deviceType,
    enqueuedAt: Date.now(),
    query: extractQuery(payload.url),
    type: payload.type as TEventType,
    pathname: extractPathname(payload.url) ?? "/",
    visitorHash,
    sessionId,
    country: null,
    region: null,
    city: null,
    os: os.name ?? null,
    browser: browser.name ?? null,
    duration: payload.duration ?? null,
    referrer: payload.referrer ?? null,
    eventName: payload.eventName ?? null,
    browserVersion: browser.version ?? null,
    screenWidth: payload.screenWidth ?? null,
    screenHeight: payload.screenHeight ?? null,
  };

  // Extract country, region, city from request headers or geo object
  const geo = await getGeolocation(request, ip);
  if (geo.country && geo.country !== "XX") {
    queuedEvent.country = geo.country.toUpperCase().slice(0, 2);
  }
  if (geo.region) {
    queuedEvent.region = geo.region;
  }
  if (geo.city) {
    queuedEvent.city = geo.city;
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

// OPTIONS /api/track - CORS preflight
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
