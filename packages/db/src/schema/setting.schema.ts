import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth.schema";

export const setting = pgTable("setting", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  appearanceSettings: jsonb("appearance_settings").$type<{
    theme: "light" | "dark" | "system";
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const settingRelation = relations(setting, ({ one }) => ({
  user: one(user, { fields: [setting.userId], references: [user.id] }),
}));
