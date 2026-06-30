import { z } from "zod";

export const aboutContentUpdateSchema = z.object({
  storyText: z.string().trim().min(1, "storyText is required").max(5000),
  missionText: z.string().trim().max(2000).optional().nullable(),
  imageUrl: z.string().trim().url("imageUrl must be a valid URL").optional().nullable(),
  imagePublicId: z.string().trim().optional().nullable(),
});

export type AboutContentUpdateInput = z.infer<typeof aboutContentUpdateSchema>;
