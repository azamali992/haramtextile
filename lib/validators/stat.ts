import { z } from "zod";

export const statCreateSchema = z.object({
  label: z.string().trim().min(1, "label is required").max(120),
  value: z.number().int("value must be a whole number").min(0),
  order: z.number().int().optional().default(0),
});

export const statUpdateSchema = statCreateSchema.partial();

export type StatCreateInput = z.infer<typeof statCreateSchema>;
export type StatUpdateInput = z.infer<typeof statUpdateSchema>;
