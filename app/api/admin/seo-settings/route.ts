import { NextRequest } from "next/server";
import { ok, notFound, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { seoSettingsUpdateSchema } from "@/lib/validators/seo-settings";
import { getSeoSettings, saveSeoSettings } from "@/lib/services/seo-settings.service";

export const dynamic = "force-dynamic";

/** GET /api/admin/seo-settings */
export async function GET() {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const settings = await getSeoSettings();
    if (!settings) {
      return notFound("SEO settings have not been set up yet.");
    }
    return ok(settings);
  } catch (error) {
    logger.error(requestId, "admin_seo_settings_get_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** PUT /api/admin/seo-settings — creates the row on first save, updates thereafter (id is always 1). */
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

    const parsed = seoSettingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid SEO settings payload.", parsed.error.flatten());
    }

    const settings = await saveSeoSettings(parsed.data);
    return ok(settings);
  } catch (error) {
    logger.error(requestId, "admin_seo_settings_update_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
