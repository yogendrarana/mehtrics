import z from "zod";

export const trackPayloadSchema = z.object({
  siteId: z.uuid("Invalid siteId"),
  type: z.enum(["pageview", "custom"]).default("pageview"),
  url: z.url("Invalid URL").max(2048),
  referrer: z.string().max(2048).optional().nullable(),
  screenWidth: z.number().int().positive().max(8192).optional().nullable(),
  eventName: z.string().max(255).optional().nullable(),
});

export type TrackPayload = z.infer<typeof trackPayloadSchema>;
