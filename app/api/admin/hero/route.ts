import { NextRequest } from "next/server";
import { ok, notFound, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { heroUpdateSchema } from "@/lib/validators/hero";
import { getHeroConfig, saveHeroConfig } from "@/lib/services/hero.service";

export const dynamic = "force-dynamic";

/** GET /api/admin/hero */
export async function GET() {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const hero = await getHeroConfig();
    if (!hero) {
      return notFound("Hero configuration has not been set up yet.");
    }
    return ok(hero);
  } catch (error) {
    logger.error(requestId, "admin_hero_get_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** PUT /api/admin/hero - creates the row on first save, updates thereafter (id is always 1). */
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

    const parsed = heroUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid hero configuration payload.", parsed.error.flatten());
    }

    const hero = await saveHeroConfig(parsed.data);
    return ok(hero);
  } catch (error) {
    logger.error(requestId, "admin_hero_update_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
