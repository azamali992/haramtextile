import { NextRequest } from "next/server";
import { noContent, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { removeProductionStepGalleryImage } from "@/lib/services/production-step.service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string; imageId: string };
}

/** DELETE /api/admin/production-steps/[id]/images/[imageId] */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    await removeProductionStepGalleryImage(params.imageId);
    return noContent();
  } catch (error) {
    logger.error(requestId, "admin_production_step_image_delete_failed", {
      productionStepId: params.id,
      imageId: params.imageId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
