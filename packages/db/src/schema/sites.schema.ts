import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth.schema";

// sites
export const sites = pgTable("sites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
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
export const siteRelations = relations(sites, ({ one }) => ({
  user: one(users, { fields: [sites.userId], references: [users.id] }),
}));
