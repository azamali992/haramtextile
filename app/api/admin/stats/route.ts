import { NextRequest } from "next/server";
import { ok, created, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { statCreateSchema } from "@/lib/validators/stat";
import { listStats, createStat } from "@/lib/services/stat.service";

export const dynamic = "force-dynamic";

/** GET /api/admin/stats */
export async function GET() {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const stats = await listStats();
    return ok(stats, { total: stats.length });
  } catch (error) {
    logger.error(requestId, "admin_stats_list_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** POST /api/admin/stats */
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

    const parsed = statCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid stat payload.", parsed.error.flatten());
    }

    const stat = await createStat(parsed.data);
    return created(stat);
  } catch (error) {
    logger.error(requestId, "admin_stat_create_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
