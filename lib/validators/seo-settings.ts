import { z } from "zod";

export const seoSettingsUpdateSchema = z.object({
  siteTitleSuffix: z.string().trim().min(1, "siteTitleSuffix is required").max(200),
  defaultMetaDescription: z
    .string()
    .trim()
    .min(1, "defaultMetaDescription is required")
    .max(300),
  googleAnalyticsId: z.string().trim().max(50).optional().nullable(),
  organizationSameAs: z.array(z.string().trim().url()).optional().default([]),
});

export type SeoSettingsUpdateInput = z.infer<typeof seoSettingsUpdateSchema>;
