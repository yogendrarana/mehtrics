import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth.schema";
import { event, aggregatedDailyStat } from "./analytic.schema";

// site
export const site = pgTable("site", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),

  // tracking key — sent in the JS snippet
  publicKey: uuid("public_key").defaultRandom().notNull().unique(),
  timezone: varchar("timezone", { length: 64 }).default("UTC").notNull(),

  // timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// relations
export const siteRelation = relations(site, ({ one, many }) => ({
  user: one(user, { fields: [site.userId], references: [user.id] }),
  event: many(event),
  aggregatedDailyStat: many(aggregatedDailyStat),
}));

// types
export type SiteSelect = typeof site.$inferSelect;
export type SiteInsert = typeof site.$inferInsert;
