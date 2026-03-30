import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  smallint,
  index,
  date,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
type TEventType = "pageview" | "custom";
type TDeviceType = "desktop" | "mobile" | "tablet" | "unknown";
type TAggregationMetric =
  | "pageviews"
  | "unique_visitors"
  | "bounce_rate"
  | "avg_duration"
  | "sessions"
  | "bounces";

import { site } from "./site.schema";

/**
 * EVENT TABLE
 */
export const event = pgTable(
  "event",
  {
    // sequential PK (better than UUID for large event tables)
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    siteId: uuid("site_id")
      .notNull()
      .references(() => site.id, { onDelete: "cascade" }),

    // pageview | custom
    type: varchar("type", { length: 32 })
      .notNull()
      .default("pageview")
      .$type<TEventType>(),

    // session tracking
    sessionId: varchar("session_id", { length: 64 }),
    duration: smallint("duration"),

    // visitor fingerprint (hashed, not a raw IP)
    visitorHash: varchar("visitor_hash", { length: 64 }),

    // page data
    url: varchar("url", { length: 2048 }).notNull(),
    referrer: varchar("referrer", { length: 2048 }),
    pathname: varchar("pathname", { length: 1024 }).notNull(),
    query: varchar("query", { length: 1024 }),

    // geo
    country: varchar("country", { length: 2 }),
    region: varchar("region", { length: 128 }),
    city: varchar("city", { length: 128 }),

    // device info / UA info
    browser: varchar("browser", { length: 64 }),
    browserVersion: varchar("browser_version", { length: 32 }),
    os: varchar("os", { length: 64 }),
    device: varchar("device", { length: 32 })
      .default("unknown")
      .$type<TDeviceType>(),

    // screen
    screenWidth: smallint("screen_width"),
    screenHeight: smallint("screen_height"),

    // custom event name (for type = "custom")
    eventName: varchar("event_name", { length: 255 }),

    // timestamp
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // primary query pattern: site + time range
    index("event_site_created_at_idx").on(table.siteId, table.createdAt),

    // page analytics
    index("event_site_pathname_idx").on(table.siteId, table.pathname),

    // referrer analytics
    index("event_site_referrer_idx").on(table.siteId, table.referrer),

    // country breakdown
    index("event_site_country_idx").on(table.siteId, table.country),

    // visitor queries
    index("event_site_visitor_idx").on(table.siteId, table.visitorHash),

    // session queries
    index("event_session_idx").on(table.sessionId),
  ],
);

/**
 * AGGREGATED DAILY STAT TABLE
 */
export const aggregatedDailyStat = pgTable(
  "aggregated_daily_stat",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    siteId: uuid("site_id")
      .notNull()
      .references(() => site.id, { onDelete: "cascade" }),

    date: date("date").notNull(),

    metric: varchar("metric", { length: 64 })
      .notNull()
      .$type<TAggregationMetric>(),

    // dimension value (pathname / country / referrer / etc)
    dimension: varchar("dimension", { length: 512 }),

    value: bigint("value", { mode: "number" }).notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // primary dashboard query: site + date range
    index("agg_site_date_idx").on(table.siteId, table.date),

    // metric query
    index("agg_site_metric_idx").on(table.siteId, table.metric),

    // metric over time
    index("agg_site_metric_date_idx").on(
      table.siteId,
      table.metric,
      table.date,
    ),
  ],
);

// relations
export const eventRelation = relations(event, ({ one }) => ({
  site: one(site, { fields: [event.siteId], references: [site.id] }),
}));

export const aggregatedDailyStatRelation = relations(
  aggregatedDailyStat,
  ({ one }) => ({
    site: one(site, {
      fields: [aggregatedDailyStat.siteId],
      references: [site.id],
    }),
  }),
);

// types
export type EventSelect = typeof event.$inferSelect;
export type EventInsert = typeof event.$inferInsert;

export type AggregatedDailyStatSelect = typeof aggregatedDailyStat.$inferSelect;
export type AggregatedDailyStatInsert = typeof aggregatedDailyStat.$inferInsert;
