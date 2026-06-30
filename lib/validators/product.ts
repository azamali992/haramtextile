import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  imageUrl: z.string().trim().url("imageUrl must be a valid URL"),
  imagePublicId: z.string().trim().min(1, "imagePublicId is required"),
  moq: z.string().trim().max(200).optional().nullable(),
  fabricType: z.string().trim().max(200).optional().nullable(),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  categoryId: z.string().trim().min(1, "categoryId is required"),
  seoTitle: z.string().trim().max(70).optional().nullable(),
  seoDescription: z.string().trim().max(160).optional().nullable(),
  focusKeyword: z.string().trim().max(100).optional().nullable(),
});

export const productUpdateSchema = productCreateSchema.partial();

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
