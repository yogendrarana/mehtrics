import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  smallint,
  index,
  date,
  bigint,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sites } from "./sites.schema";

// enums
export const eventTypeEnum = pgEnum("event_type", ["pageview", "custom"]);

export const deviceTypeEnum = pgEnum("device_type", [
  "desktop",
  "mobile",
  "tablet",
  "unknown",
]);

export const aggregationMetricEnum = pgEnum("aggregation_metric", [
  "pageviews",
  "unique_visitors",
  "bounce_rate",
  "avg_duration",
]);

// events table
export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    type: eventTypeEnum("type").default("pageview").notNull(),

    // Page data
    url: varchar("url", { length: 2048 }).notNull(),
    referrer: varchar("referrer", { length: 2048 }),
    pathname: varchar("pathname", { length: 1024 }),

    // Visitor fingerprint (hashed — never store raw IP)
    visitorHash: varchar("visitor_hash", { length: 64 }),

    // Geo
    country: varchar("country", { length: 2 }), // ISO 3166-1 alpha-2
    region: varchar("region", { length: 128 }),
    city: varchar("city", { length: 128 }),

    // Device info (parsed from UA)
    browser: varchar("browser", { length: 64 }),
    browserVersion: varchar("browser_version", { length: 32 }),
    os: varchar("os", { length: 64 }),
    device: deviceTypeEnum("device").default("unknown"),

    // Screen
    screenWidth: smallint("screen_width"),

    // Session duration (in seconds, updated on exit)
    duration: smallint("duration"),

    // Custom event name (for type = "custom")
    eventName: varchar("event_name", { length: 255 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Primary query pattern: site + time range
    index("events_site_id_created_at_idx").on(table.siteId, table.createdAt),

    // Pathname breakdown
    index("events_site_id_pathname_idx").on(table.siteId, table.pathname),

    // Referrer breakdown
    index("events_site_id_referrer_idx").on(table.siteId, table.referrer),

    // Country breakdown
    index("events_site_id_country_idx").on(table.siteId, table.country),
  ],
);

// aggregated daily stats table
export const aggregatedDailyStats = pgTable(
  "aggregated_daily_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    metric: aggregationMetricEnum("metric").notNull(),
    value: bigint("value", { mode: "number" }).notNull().default(0),
    // Breakdown dimension (e.g. "US" for country, "/blog" for pathname)
    dimension: varchar("dimension", { length: 512 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Primary dashboard query: site + date range
    index("aggregated_daily_stats_site_date_idx").on(table.siteId, table.date),

    // Metric-specific query
    index("aggregated_daily_stats_site_metric_idx").on(
      table.siteId,
      table.metric,
    ),
  ],
);

// relations
export const eventsRelations = relations(events, ({ one }) => ({
  site: one(sites, { fields: [events.siteId], references: [sites.id] }),
}));

export const aggregatedDailyStatRelations = relations(
  aggregatedDailyStats,
  ({ one }) => ({
    site: one(sites, {
      fields: [aggregatedDailyStats.siteId],
      references: [sites.id],
    }),
  }),
);
