import * as maxmind from "maxmind";
import type { CityResponse } from "maxmind";
import path from "path";
import fs from "fs";

// Get geolocation info from various proxy headers
// Supports Next.js edge runtime, Vercel, Cloudflare, Cloudfront
// Includes a fallback to MaxMind GeoLite2 in case no headers are available.

let maxmindPromise: Promise<maxmind.Reader<CityResponse> | null> | null = null;

async function getGeoFromMaxmind(ip: string) {
  if (!maxmindPromise) {
    maxmindPromise = (async () => {
      const dbPath =
        process.env.GEOLITE_DB_PATH ||
        path.join(process.cwd(), "geolite", "GeoLite2-City.mmdb");

      if (fs.existsSync(dbPath)) {
        try {
          return await maxmind.open<CityResponse>(dbPath);
        } catch {
          return null;
        }
      }

      return null;
    })();
  }

  const reader = await maxmindPromise;
  if (!reader) return null;

  try {
    const geo = reader.get(ip);
    if (!geo) return null;
    return {
      country:
        geo.country?.iso_code || geo.registered_country?.iso_code || null,
      region: geo.subdivisions?.[0]?.iso_code || null,
      city: geo.city?.names?.en || null,
    };
  } catch {
    return null;
  }
}

export async function getGeolocation(request: any, ip: string) {
  if (request.geo) {
    return {
      country: request.geo.country || null,
      region: request.geo.region || null,
      city: request.geo.city || null,
    };
  }

  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("cloudfront-viewer-country");

  const region =
    request.headers.get("x-vercel-ip-country-region") ||
    request.headers.get("cf-region") ||
    request.headers.get("cloudfront-viewer-country-region-name");

  const city =
    request.headers.get("x-vercel-ip-city") ||
    request.headers.get("cf-ipcity") ||
    request.headers.get("cloudfront-viewer-city");

  // If any header provides country, we use headers. Otherwise use maxmind fallback.
  if (country) {
    return { country, region: region || null, city: city || null };
  }

  // Fallback to maxmind
  const maxmindGeo = await getGeoFromMaxmind(ip);
  console.log("maxmind geo", maxmindGeo);

  if (maxmindGeo) {
    return maxmindGeo;
  }

  return { country: null, region: null, city: null };
}
