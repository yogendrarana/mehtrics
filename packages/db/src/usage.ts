import {
  db,
  site,
  event,
  subscription,
  plan,
  count,
  eq,
  and,
  gte,
  inArray,
} from "@mehtrics/db";

/**
 * Get the current monthly event count for a user.
 */
export async function getMonthlyEventCount(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all site IDs for this user
  const userSiteList = await db
    .select({ id: site.id })
    .from(site)
    .where(eq(site.userId, userId));

  const siteIds = userSiteList.map((s) => s.id);
  if (siteIds.length === 0) return 0;

  const [result] = await db
    .select({ value: count() })
    .from(event)
    .where(
      and(inArray(event.siteId, siteIds), gte(event.createdAt, startOfMonth)),
    );

  return result?.value ?? 0;
}

/**
 * Checks if a user has exceeded their current plan's limits.
 */
export async function checkPlanLimits(userId: string) {
  // 1. Get user's subscription and plan
  const [sub] = await db
    .select({
      status: subscription.status,
      eventLimit: plan.eventLimit,
      siteLimit: plan.siteLimit,
    })
    .from(subscription)
    .innerJoin(plan, eq(subscription.planId, plan.id))
    .where(eq(subscription.userId, userId))
    .limit(1);

  // Default to Free plan if no subscription
  const limit = sub ?? {
    status: "active",
    eventLimit: 10_000,
    siteLimit: 1,
  };

  // 2. Count sites
  const [siteCountResult] = await db
    .select({ value: count() })
    .from(site)
    .where(eq(site.userId, userId));

  const siteCount = siteCountResult?.value ?? 0;

  // 3. Count events (approximate for performance)
  // In a real app, we'd cache this in Redis
  const eventCount = await getMonthlyEventCount(userId);

  return {
    canAddSite: limit.siteLimit === 0 || siteCount < limit.siteLimit,
    canIngestEvent: limit.eventLimit === 0 || eventCount < limit.eventLimit,
    usage: {
      site: siteCount,
      siteLimit: limit.siteLimit,
      event: eventCount,
      eventLimit: limit.eventLimit,
    },
  };
}
