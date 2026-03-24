import z from "zod";
import type { TEventType } from "@/lib/types";

export const trackPayloadSchema = z.object({
  siteId: z.string().uuid("Invalid siteId"),
  type: z.enum(["pageview", "custom"]).default("pageview"),
  url: z.string().url("Invalid URL").max(2048),
  referrer: z.string().max(2048).optional().nullable(),
  screenWidth: z.number().int().positive().max(8192).optional().nullable(),
  screenHeight: z.number().int().positive().max(8192).optional().nullable(),
  sessionId: z.string().max(64).optional().nullable(),
  duration: z.number().int().nonnegative().optional().nullable(),
  eventName: z.string().max(255).optional().nullable(),
});

export type TrackPayload = z.infer<typeof trackPayloadSchema>;
