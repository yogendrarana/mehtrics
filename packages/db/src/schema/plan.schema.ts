import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { subscription } from "./subscription.schema";

// enums
export const planIntervalEnum = pgEnum("plan_interval", ["monthly", "yearly"]);

// plan
export const plan = pgTable("plan", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  description: text("description"),

  // monthly event limit (0 = unlimited)
  eventLimit: integer("event_limit").notNull().default(100_000),
  siteLimit: integer("site_limit").notNull().default(3),
  priceMonthly: integer("price_monthly").notNull().default(0), // in cents
  priceYearly: integer("price_yearly").notNull().default(0), // in cents
  stripePriceMonthlyId: varchar("stripe_price_monthly_id", { length: 128 }),
  stripePriceYearlyId: varchar("stripe_price_yearly_id", { length: 128 }),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),

  // timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// relations
export const planRelation = relations(plan, ({ many }) => ({
  subscription: many(subscription),
}));
