import { z } from "zod";

export const teamMemberCreateSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(200),
  role: z.string().trim().min(1, "role is required").max(200),
  email: z.string().trim().email("email must be a valid email address").max(200),
  order: z.number().int().optional().default(0),
});

export const teamMemberUpdateSchema = teamMemberCreateSchema.partial();

export type TeamMemberCreateInput = z.infer<typeof teamMemberCreateSchema>;
export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>;
