import { NextRequest } from "next/server";
import { ok, created, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { certificationCreateSchema } from "@/lib/validators/certification";
import { listCertifications, createCertification } from "@/lib/services/certification.service";

export const dynamic = "force-dynamic";

/** GET /api/admin/certifications */
export async function GET() {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const certifications = await listCertifications();
    return ok(certifications, { total: certifications.length });
  } catch (error) {
    logger.error(requestId, "admin_certifications_list_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** POST /api/admin/certifications */
export async function POST(request: NextRequest) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const body = await request.json().catch(() => null);
    if (body === null) {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = certificationCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid certification payload.", parsed.error.flatten());
    }

    const certification = await createCertification(parsed.data);
    return created(certification);
  } catch (error) {
    logger.error(requestId, "admin_certification_create_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
