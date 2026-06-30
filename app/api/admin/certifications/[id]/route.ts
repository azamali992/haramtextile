import { NextRequest } from "next/server";
import {
  ok,
  noContent,
  notFound,
  validationError,
  unauthenticated,
  internalError,
} from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { certificationUpdateSchema } from "@/lib/validators/certification";

export const dynamic = "force-dynamic";
import {
  getCertificationById,
  updateCertification,
  deleteCertification,
} from "@/lib/services/certification.service";

interface RouteParams {
  params: { id: string };
}

/** GET /api/admin/certifications/[id] */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const certification = await getCertificationById(params.id);
    if (!certification) {
      return notFound("Certification not found.");
    }
    return ok(certification);
  } catch (error) {
    logger.error(requestId, "admin_certification_get_failed", {
      certificationId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** PUT /api/admin/certifications/[id] */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getCertificationById(params.id);
    if (!existing) {
      return notFound("Certification not found.");
    }

    const body = await request.json().catch(() => null);
    if (body === null) {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = certificationUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid certification payload.", parsed.error.flatten());
    }

    const certification = await updateCertification(params.id, parsed.data);
    return ok(certification);
  } catch (error) {
    logger.error(requestId, "admin_certification_update_failed", {
      certificationId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** DELETE /api/admin/certifications/[id] */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getCertificationById(params.id);
    if (!existing) {
      return notFound("Certification not found.");
    }

    await deleteCertification(params.id);
    return noContent();
  } catch (error) {
    logger.error(requestId, "admin_certification_delete_failed", {
      certificationId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
