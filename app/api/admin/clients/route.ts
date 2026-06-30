import { NextRequest } from "next/server";
import { ok, created, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { clientLogoCreateSchema } from "@/lib/validators/client-logo";
import { listClientLogos, createClientLogo } from "@/lib/services/client-logo.service";

export const dynamic = "force-dynamic";

/** GET /api/admin/clients */
export async function GET() {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const logos = await listClientLogos();
    return ok(logos, { total: logos.length });
  } catch (error) {
    logger.error(requestId, "admin_clients_list_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** POST /api/admin/clients */
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

    const parsed = clientLogoCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid client logo payload.", parsed.error.flatten());
    }

    const logo = await createClientLogo(parsed.data);
    return created(logo);
  } catch (error) {
    logger.error(requestId, "admin_client_create_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
