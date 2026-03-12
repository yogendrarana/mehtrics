import path from "path";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

/**
 * GET /api/script.js - Serve the tracking script
 *
 * In production, serve pre-built dist/tracker.js.
 * In development, serve a stub.
 */

export async function GET() {
  let scriptContent: string;

  try {
    if (process.env["NODE_ENV"] === "development") {
      const scriptPath = path.join(
        process.cwd(),
        "../../packages/analytics/dist/tracker.js",
      );
      scriptContent = await readFile(scriptPath, "utf-8");
    } else {
      scriptContent = `/* Mehtrics tracker - development mode */
        (function(){
          console.log('[Mehtrics] Tracker loaded (dev mode)');
          window.mehtrics = { track: function(name){ console.log('[Mehtrics] track:', name); } };
        })();`;
    }
  } catch {
    scriptContent = `/* Mehtrics tracker - error loading script */`;
  }

  return new NextResponse(scriptContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
