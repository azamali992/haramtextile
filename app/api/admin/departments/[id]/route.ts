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
import { departmentUpdateSchema } from "@/lib/validators/department";
import {
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "@/lib/services/department.service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** GET /api/admin/departments/[id] */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const department = await getDepartmentById(params.id);
    if (!department) {
      return notFound("Department not found.");
    }
    return ok(department);
  } catch (error) {
    logger.error(requestId, "admin_department_get_failed", {
      departmentId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** PUT /api/admin/departments/[id] */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getDepartmentById(params.id);
    if (!existing) {
      return notFound("Department not found.");
    }

    const body = await request.json().catch(() => null);
    if (body === null) {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = departmentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid department payload.", parsed.error.flatten());
    }

    const department = await updateDepartment(params.id, parsed.data);
    return ok(department);
  } catch (error) {
    logger.error(requestId, "admin_department_update_failed", {
      departmentId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** DELETE /api/admin/departments/[id] */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getDepartmentById(params.id);
    if (!existing) {
      return notFound("Department not found.");
    }

    await deleteDepartment(params.id);
    return noContent();
  } catch (error) {
    logger.error(requestId, "admin_department_delete_failed", {
      departmentId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
