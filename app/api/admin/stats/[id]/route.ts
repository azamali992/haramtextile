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
import { statUpdateSchema } from "@/lib/validators/stat";

export const dynamic = "force-dynamic";
import { getStatById, updateStat, deleteStat } from "@/lib/services/stat.service";

interface RouteParams {
  params: { id: string };
}

/** GET /api/admin/stats/[id] */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const stat = await getStatById(params.id);
    if (!stat) {
      return notFound("Stat not found.");
    }
    return ok(stat);
  } catch (error) {
    logger.error(requestId, "admin_stat_get_failed", {
      statId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** PUT /api/admin/stats/[id] */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getStatById(params.id);
    if (!existing) {
      return notFound("Stat not found.");
    }

    const body = await request.json().catch(() => null);
    if (body === null) {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = statUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid stat payload.", parsed.error.flatten());
    }

    const stat = await updateStat(params.id, parsed.data);
    return ok(stat);
  } catch (error) {
    logger.error(requestId, "admin_stat_update_failed", {
      statId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** DELETE /api/admin/stats/[id] */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getStatById(params.id);
    if (!existing) {
      return notFound("Stat not found.");
    }

    await deleteStat(params.id);
    return noContent();
  } catch (error) {
    logger.error(requestId, "admin_stat_delete_failed", {
      statId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
