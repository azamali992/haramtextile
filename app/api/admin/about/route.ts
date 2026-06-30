import { NextRequest } from "next/server";
import { ok, notFound, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { aboutContentUpdateSchema } from "@/lib/validators/about-content";
import { getAboutContent, saveAboutContent } from "@/lib/services/about-content.service";

export const dynamic = "force-dynamic";

/** GET /api/admin/about */
export async function GET() {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const about = await getAboutContent();
    if (!about) {
      return notFound("About content has not been set up yet.");
    }
    return ok(about);
  } catch (error) {
    logger.error(requestId, "admin_about_get_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** PUT /api/admin/about — creates the row on first save, updates thereafter (id is always 1). */
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

    const parsed = aboutContentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid about content payload.", parsed.error.flatten());
    }

    const about = await saveAboutContent(parsed.data);
    return ok(about);
  } catch (error) {
    logger.error(requestId, "admin_about_update_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
