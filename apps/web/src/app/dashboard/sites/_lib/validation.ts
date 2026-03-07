import { z } from "zod";

export const CreateSiteSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  domain: z
    .string()
    .min(1, "Domain is required")
    // Simple domain regex
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i,
      "Please enter a valid domain (e.g. example.com)",
    ),
});

export type TCreateSiteSchema = z.infer<typeof CreateSiteSchema>;
