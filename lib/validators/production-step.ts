import { z } from "zod";

export const productionStepCreateSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "slug is required")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "slug must be lowercase, alphanumeric, and hyphen-separated",
    ),
  description: z.string().trim().min(1, "description is required").max(5000),
  statLabel: z.string().trim().max(100).optional().nullable(),
  statValue: z.string().trim().max(100).optional().nullable(),
  imageUrl: z.string().trim().url("imageUrl must be a valid URL"),
  imagePublicId: z.string().trim().min(1, "imagePublicId is required"),
  order: z.number().int().optional().default(0),
});

export const productionStepUpdateSchema = productionStepCreateSchema.partial();

export type ProductionStepCreateInput = z.infer<typeof productionStepCreateSchema>;
export type ProductionStepUpdateInput = z.infer<typeof productionStepUpdateSchema>;
