import { db } from "./client";
import { plan } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  console.log("-> Seeding plan...");

  await db
    .insert(plan)
    .values([
      {
        name: "Free",
        description: "Get started — no credit card required",
        eventLimit: 10_000,
        siteLimit: 1,
        priceMonthly: 0,
        priceYearly: 0,
        isActive: true,
        isFeatured: false,
      },
      {
        name: "Starter",
        description: "For growing projects",
        eventLimit: 100_000,
        siteLimit: 5,
        // $9/mo
        priceMonthly: 900,
        // $86.40/yr
        priceYearly: 8640,
        isActive: true,
        isFeatured: false,
      },
      {
        name: "Pro",
        description: "For serious analytics",
        eventLimit: 1_000_000,
        siteLimit: 20,
        // $19/mo
        priceMonthly: 1900,
        // $182.40/yr
        priceYearly: 18240,
        isActive: true,
        isFeatured: true,
      },
      {
        name: "Business",
        description: "Unlimited scale",
        // 0 = unlimited
        eventLimit: 0,
        // 0 = unlimited
        siteLimit: 0,
        // $49/mo
        priceMonthly: 4900,
        // $470.40/yr
        priceYearly: 47040,
        isActive: true,
        isFeatured: false,
      },
    ])
    .onConflictDoNothing();

  console.log("Database seeded successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
