import { NextRequest } from "next/server";
import { ok, created, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { productionStepCreateSchema } from "@/lib/validators/production-step";
import {
  listProductionSteps,
  createProductionStep,
} from "@/lib/services/production-step.service";

export const dynamic = "force-dynamic";

/** GET /api/admin/production-steps */
export async function GET() {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const productionSteps = await listProductionSteps();
    return ok(productionSteps, { total: productionSteps.length });
  } catch (error) {
    logger.error(requestId, "admin_production_steps_list_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** POST /api/admin/production-steps */
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

    const parsed = productionStepCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid production step payload.", parsed.error.flatten());
    }

    const productionStep = await createProductionStep(parsed.data);
    return created(productionStep);
  } catch (error) {
    logger.error(requestId, "admin_production_step_create_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
