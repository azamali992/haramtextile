import { z } from "zod";

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(200),
  email: z.string().trim().email("email must be valid").max(254),
  company: z.string().trim().max(200).optional().nullable(),
  message: z.string().trim().min(1, "message is required").max(5000),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

export const submissionUpdateSchema = z.object({
  isRead: z.boolean(),
});

export type SubmissionUpdateInput = z.infer<typeof submissionUpdateSchema>;
