import { NextRequest } from "next/server";
import {
  created,
  notFound,
  validationError,
  unauthenticated,
  internalError,
} from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { productionStepImageCreateSchema } from "@/lib/validators/production-step";
import {
  getProductionStepById,
  addProductionStepGalleryImage,
} from "@/lib/services/production-step.service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** POST /api/admin/production-steps/[id]/images */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getProductionStepById(params.id);
    if (!existing) {
      return notFound("Production step not found.");
    }

    const body = await request.json().catch(() => null);
    if (body === null) {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = productionStepImageCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid gallery image payload.", parsed.error.flatten());
    }

    const image = await addProductionStepGalleryImage(params.id, parsed.data);
    return created(image);
  } catch (error) {
    logger.error(requestId, "admin_production_step_image_create_failed", {
      productionStepId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
