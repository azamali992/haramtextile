import { z } from "zod";

export const statCreateSchema = z.object({
  label: z.string().trim().min(1, "label is required").max(120),
  value: z.number().int("value must be a whole number").min(0),
  order: z.number().int().optional().default(0),
});

// See production-step.ts for why this can't be a plain `.partial()`: Zod's
// `.default()` on `order` still fires when the key is absent, which would
// silently reset `order` to 0 on every edit that omits it.
export const statUpdateSchema = statCreateSchema
  .omit({ order: true })
  .partial()
  .extend({ order: z.number().int().optional() });

export type StatCreateInput = z.infer<typeof statCreateSchema>;
export type StatUpdateInput = z.infer<typeof statUpdateSchema>;
