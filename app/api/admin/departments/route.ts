import { NextRequest } from "next/server";
import { ok, created, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { departmentCreateSchema } from "@/lib/validators/department";
import { listDepartments, createDepartment } from "@/lib/services/department.service";

export const dynamic = "force-dynamic";

/** GET /api/admin/departments */
export async function GET() {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const departments = await listDepartments();
    return ok(departments, { total: departments.length });
  } catch (error) {
    logger.error(requestId, "admin_departments_list_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** POST /api/admin/departments */
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

    const parsed = departmentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid department payload.", parsed.error.flatten());
    }

    const department = await createDepartment(parsed.data);
    return created(department);
  } catch (error) {
    logger.error(requestId, "admin_department_create_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
