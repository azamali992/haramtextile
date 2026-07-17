import { z } from "zod";

export const contactEmailSchema = z.object({
  label: z.string().trim().min(1, "label is required").max(60),
  email: z.string().trim().email("must be a valid email address").max(200),
});

export const contactSettingsUpdateSchema = z.object({
  phone: z.string().trim().min(1, "phone is required").max(60),
  address: z.string().trim().min(1, "address is required").max(400),
  mapLink: z
    .string()
    .trim()
    .url("mapLink must be a valid URL")
    .max(500)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  hours: z.string().trim().max(200).optional().nullable(),
  /** Ordered for display; the first entry is treated as the primary address. */
  emails: z.array(contactEmailSchema).max(10, "at most 10 email addresses"),
});

export type ContactEmailInput = z.infer<typeof contactEmailSchema>;
export type ContactSettingsUpdateInput = z.infer<typeof contactSettingsUpdateSchema>;
