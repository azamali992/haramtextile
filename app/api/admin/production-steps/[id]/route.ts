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
import { productionStepUpdateSchema } from "@/lib/validators/production-step";

export const dynamic = "force-dynamic";
import {
  getProductionStepById,
  updateProductionStep,
  deleteProductionStep,
} from "@/lib/services/production-step.service";

interface RouteParams {
  params: { id: string };
}

/** GET /api/admin/production-steps/[id] */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const productionStep = await getProductionStepById(params.id);
    if (!productionStep) {
      return notFound("Production step not found.");
    }
    return ok(productionStep);
  } catch (error) {
    logger.error(requestId, "admin_production_step_get_failed", {
      productionStepId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** PUT /api/admin/production-steps/[id] */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const parsed = productionStepUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid production step payload.", parsed.error.flatten());
    }

    const productionStep = await updateProductionStep(params.id, parsed.data);
    return ok(productionStep);
  } catch (error) {
    logger.error(requestId, "admin_production_step_update_failed", {
      productionStepId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** DELETE /api/admin/production-steps/[id] */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

    await deleteProductionStep(params.id);
    return noContent();
  } catch (error) {
    logger.error(requestId, "admin_production_step_delete_failed", {
      productionStepId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
