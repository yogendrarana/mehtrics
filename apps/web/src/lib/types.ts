export type TEventType = "pageview" | "custom";

export type TDeviceType = "desktop" | "mobile" | "tablet" | "unknown";

export type TAggregationMetric =
  | "pageviews"
  | "unique_visitors"
  | "bounce_rate"
  | "avg_duration"
  | "sessions"
  | "bounces";

export type QueuedEvent = {
  siteId: string;
  type: TEventType;
  url: string;
  pathname: string;
  visitorHash: string;
  referrer?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  browser?: string | null;
  browserVersion?: string | null;
  os?: string | null;
  device?: TDeviceType | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  query?: string | null;
  sessionId?: string | null;
  duration?: number | null;
  eventName?: string | null;
  enqueuedAt: number;
};

export type TrackPayload = {
  siteId: string;
  type: TEventType;
  url: string;
  referrer?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  sessionId?: string | null;
  duration?: number | null;
  eventName?: string | null;
};
