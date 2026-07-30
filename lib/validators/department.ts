import { z } from "zod";

export const departmentCreateSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120),
  order: z.number().int().optional().default(0),
});

export const departmentUpdateSchema = departmentCreateSchema.partial();

export type DepartmentCreateInput = z.infer<typeof departmentCreateSchema>;
export type DepartmentUpdateInput = z.infer<typeof departmentUpdateSchema>;
