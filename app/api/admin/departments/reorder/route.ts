import { NextRequest } from "next/server";
import { ok, validationError, notFound, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { swapDepartmentOrder } from "@/lib/services/department.service";

export const dynamic = "force-dynamic";

/** POST /api/admin/departments/reorder */
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

    const { firstId, secondId } = body as { firstId?: unknown; secondId?: unknown };
    if (
      typeof firstId !== "string" ||
      firstId.trim() === "" ||
      typeof secondId !== "string" ||
      secondId.trim() === ""
    ) {
      return validationError("firstId and secondId are required non-empty strings.");
    }

    const result = await swapDepartmentOrder(firstId, secondId);
    if (!result) {
      return notFound("One or both departments were not found.");
    }

    const [first, second] = result;
    return ok({ first, second });
  } catch (error) {
    logger.error(requestId, "admin_department_reorder_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
