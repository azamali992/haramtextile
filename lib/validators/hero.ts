import { z } from "zod";

export const heroUpdateSchema = z.object({
  headline: z.string().trim().min(1, "headline is required").max(200),
  subtext: z.string().trim().max(500).optional().nullable(),
  ctaText: z.string().trim().max(100).optional().nullable(),
  ctaLink: z.string().trim().max(300).optional().nullable(),
  imageUrl: z.string().trim().url("imageUrl must be a valid URL").optional().nullable(),
  imagePublicId: z.string().trim().optional().nullable(),
});

export type HeroUpdateInput = z.infer<typeof heroUpdateSchema>;
