import path from "path";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

/**
 * GET /api/script.js - Serve the tracking script
 *
 * In production, serve pre-built dist/tracker.js.
 */

export async function GET() {
  try {
    const scriptPath = path.join(process.cwd(), "public", "tracker.js");
    const scriptContent = await readFile(scriptPath, "utf-8");

    return new NextResponse(scriptContent, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[API] Failed to serve tracker.js. Ensure you have run 'bun run build:tracker'. Error:", err);
    return new NextResponse(`/* Mehtrics tracker - Error: tracker.js not found. Run 'bun run build:tracker' on the server. */`, {
      status: 404,
      headers: { "Content-Type": "application/javascript" },
    });
  }
}
