import { ok, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { listCertifications } from "@/lib/services/certification.service";

// DB-backed and admin-editable — never statically cache at build time.
export const dynamic = "force-dynamic";

/**
 * Strips internal-only fields (e.g. the Cloudinary `imagePublicId`) before a
 * certification record is sent to a public client. Keep in sync with the
 * mapping in `app/api/certifications/[id]/route.ts`.
 */
function toPublicCertification(certification: Awaited<ReturnType<typeof listCertifications>>[number]) {
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

/** GET /api/certifications — public listing of all certifications. */
export async function GET() {
  const requestId = newRequestId();
  try {
    const certifications = await listCertifications();
    const data = certifications.map(toPublicCertification);
    return ok(data, { total: data.length });
  } catch (error) {
    logger.error(requestId, "certifications_list_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
