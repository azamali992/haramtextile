import { z } from "zod";

export const clientLogoCreateSchema = z.object({
  imageUrl: z.string().trim().url("imageUrl must be a valid URL"),
  imagePublicId: z.string().trim().min(1, "imagePublicId is required"),
  altText: z.string().trim().min(1, "altText is required").max(200),
  order: z.number().int().optional().default(0),
});

export type ClientLogoCreateInput = z.infer<typeof clientLogoCreateSchema>;
