import { NextRequest } from "next/server";
import { noContent, notFound, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { getClientLogoById, deleteClientLogo } from "@/lib/services/client-logo.service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** DELETE /api/admin/clients/[id] */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getClientLogoById(params.id);
    if (!existing) {
      return notFound("Client logo not found.");
    }

    await deleteClientLogo(params.id);
    return noContent();
  } catch (error) {
    logger.error(requestId, "admin_client_delete_failed", {
      clientLogoId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
