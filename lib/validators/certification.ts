import { z } from "zod";

export const certificationCreateSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  issuingBody: z.string().trim().max(200).optional().nullable(),
  imageUrl: z.string().trim().url("imageUrl must be a valid URL"),
  imagePublicId: z.string().trim().min(1, "imagePublicId is required"),
  pdfUrl: z.string().trim().url("pdfUrl must be a valid URL").optional().nullable(),
  pdfPublicId: z.string().trim().min(1).optional().nullable(),
  seoTitle: z.string().trim().max(70).optional().nullable(),
  seoDescription: z.string().trim().max(160).optional().nullable(),
});

export const certificationUpdateSchema = certificationCreateSchema.partial();

export type CertificationCreateInput = z.infer<typeof certificationCreateSchema>;
export type CertificationUpdateInput = z.infer<typeof certificationUpdateSchema>;
