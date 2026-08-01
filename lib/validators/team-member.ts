import { z } from "zod";

export const teamMemberCreateSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(200),
  role: z.string().trim().min(1, "role is required").max(200),
  email: z.string().trim().email("email must be a valid email address").max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  order: z.number().int().optional().default(0),
  // Department the member belongs to (null/empty = unassigned).
  departmentId: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
});

export const teamMemberUpdateSchema = teamMemberCreateSchema.partial();

export type TeamMemberCreateInput = z.infer<typeof teamMemberCreateSchema>;
export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>;
