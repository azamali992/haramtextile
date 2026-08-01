import { z } from "zod";

export const departmentCreateSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120),
  order: z.number().int().optional().default(0),
});

// See production-step.ts for why this can't be a plain `.partial()`: Zod's
// `.default()` on `order` still fires when the key is absent, which would
// silently reset `order` to 0 on every edit that omits it.
export const departmentUpdateSchema = departmentCreateSchema
  .omit({ order: true })
  .partial()
  .extend({ order: z.number().int().optional() });

export type DepartmentCreateInput = z.infer<typeof departmentCreateSchema>;
export type DepartmentUpdateInput = z.infer<typeof departmentUpdateSchema>;
