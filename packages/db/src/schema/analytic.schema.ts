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
import { site } from "./site.schema";

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

// event table
export const event = pgTable(
  "event",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => site.id, { onDelete: "cascade" }),
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
    index("event_site_id_created_at_idx").on(table.siteId, table.createdAt),

    // Pathname breakdown
    index("event_site_id_pathname_idx").on(table.siteId, table.pathname),

    // Referrer breakdown
    index("event_site_id_referrer_idx").on(table.siteId, table.referrer),

    // Country breakdown
    index("event_site_id_country_idx").on(table.siteId, table.country),
  ],
);

// aggregated daily stat table
export const aggregatedDailyStat = pgTable(
  "aggregated_daily_stat",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => site.id, { onDelete: "cascade" }),
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
    index("aggregated_daily_stat_site_date_idx").on(table.siteId, table.date),

    // Metric-specific query
    index("aggregated_daily_stat_site_metric_idx").on(
      table.siteId,
      table.metric,
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
