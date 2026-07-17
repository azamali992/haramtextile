import { NextRequest } from "next/server";
import { ok, notFound, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { contactSettingsUpdateSchema } from "@/lib/validators/contact-settings";
import { getContactSettings, saveContactSettings } from "@/lib/services/contact-settings.service";

export const dynamic = "force-dynamic";

/** GET /api/admin/contact-settings */
export async function GET() {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const settings = await getContactSettings();
    if (!settings) {
      return notFound("Contact settings have not been set up yet.");
    }
    return ok(settings);
  } catch (error) {
    logger.error(requestId, "admin_contact_settings_get_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** PUT /api/admin/contact-settings - creates the row on first save, updates thereafter (id is always 1). */
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

    const parsed = contactSettingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid contact settings payload.", parsed.error.flatten());
    }

    const settings = await saveContactSettings(parsed.data);
    return ok(settings);
  } catch (error) {
    logger.error(requestId, "admin_contact_settings_update_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
