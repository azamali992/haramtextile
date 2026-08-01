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

// Built via `.omit({ order: true })` rather than a plain `.partial()`: Zod's
// `.default()` on the `order` field still fires when the key is absent from
// the input, even under `.partial()`, which would silently reset `order` to
// 0 on every edit that doesn't touch it (the admin form never sends `order`
// unless the user explicitly changes it). Re-adding `order` as a bare
// optional (no default) keeps updates a true no-op when the key is omitted.
export const productionStepUpdateSchema = productionStepCreateSchema
  .omit({ order: true })
  .partial()
  .extend({ order: z.number().int().optional() });

export type ProductionStepCreateInput = z.infer<typeof productionStepCreateSchema>;
export type ProductionStepUpdateInput = z.infer<typeof productionStepUpdateSchema>;

export const productionStepImageCreateSchema = z.object({
  imageUrl: z.string().trim().url("imageUrl must be a valid URL"),
  imagePublicId: z.string().trim().min(1, "imagePublicId is required"),
});

export type ProductionStepImageCreateInput = z.infer<typeof productionStepImageCreateSchema>;
