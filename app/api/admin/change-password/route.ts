import { NextRequest } from "next/server";
import { ok, badRequest, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { changePasswordSchema } from "@/lib/validators/change-password";
import { changeAdminPassword } from "@/lib/services/admin-user.service";

export const dynamic = "force-dynamic";

/** PUT /api/admin/change-password - changes the signed-in admin's own password. */
export async function PUT(request: NextRequest) {
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

    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid password payload.", parsed.error.flatten());
    }

    const result = await changeAdminPassword(
      session.user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );

    if (!result.ok) {
      // Both cases surface as a 400 with a generic-enough message; we never
      // reveal more than "current password is incorrect".
      return badRequest("Current password is incorrect.");
    }

    return ok({ changed: true });
  } catch (error) {
    logger.error(requestId, "admin_change_password_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
