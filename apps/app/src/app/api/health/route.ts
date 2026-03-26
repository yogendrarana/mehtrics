import { NextResponse } from "next/server";
import { db } from "@mehtrics/db";
import { getRedisClient } from "@/config/redis";

/**
 * GET /api/health
 *
 * Used by Docker health checks and monitoring tools.
 * Returns 200 if all critical services are reachable.
 */

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};

  // Check PostgreSQL
  try {
    await db.execute("SELECT 1" as never);
    checks["postgres"] = "ok";
  } catch {
    checks["postgres"] = "error";
  }

  // Check Redis
  try {
    const redis = getRedisClient();
    await redis.ping();
    checks["redis"] = "ok";
  } catch {
    checks["redis"] = "error";
  }

  const allHealthy = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    { status: allHealthy ? "healthy" : "degraded", checks },
    { status: allHealthy ? 200 : 503 },
  );
}
