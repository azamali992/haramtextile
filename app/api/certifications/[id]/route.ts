import { ok, notFound, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { getCertificationById } from "@/lib/services/certification.service";

export const dynamic = "force-dynamic";

/**
 * Strips internal-only fields (e.g. the Cloudinary `imagePublicId`) before a
 * certification record is sent to a public client. Keep in sync with the
 * mapping in `app/api/certifications/route.ts`.
 */
function toPublicCertification(certification: Awaited<ReturnType<typeof getCertificationById>>) {
  if (!certification) return certification;
  return {
    id: certification.id,
    name: certification.name,
    description: certification.description,
    issuingBody: certification.issuingBody,
    imageUrl: certification.imageUrl,
    seoTitle: certification.seoTitle,
    seoDescription: certification.seoDescription,
    createdAt: certification.createdAt,
    updatedAt: certification.updatedAt,
  };
}

/** GET /api/certifications/[id] — public single-certification lookup. 404 if missing. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const requestId = newRequestId();
  try {
    const certification = await getCertificationById(params.id);

    if (!certification) {
      return notFound("Certification not found.");
    }

    return ok(toPublicCertification(certification));
  } catch (error) {
    logger.error(requestId, "certification_get_failed", {
      certificationId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
