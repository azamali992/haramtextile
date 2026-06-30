import { ok, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { listClientLogos } from "@/lib/services/client-logo.service";

// DB-backed and admin-editable — never statically cache at build time.
export const dynamic = "force-dynamic";

/**
 * Strips internal-only fields (e.g. the Cloudinary `imagePublicId`) before a
 * client logo record is sent to a public client.
 */
function toPublicClientLogo(logo: Awaited<ReturnType<typeof listClientLogos>>[number]) {
  return {
    id: logo.id,
    imageUrl: logo.imageUrl,
    altText: logo.altText,
    order: logo.order,
    createdAt: logo.createdAt,
  };
}

/** GET /api/clients — public listing of client logos, ordered for display. */
export async function GET() {
  const requestId = newRequestId();
  try {
    const logos = await listClientLogos();
    const data = logos.map(toPublicClientLogo);
    return ok(data, { total: data.length });
  } catch (error) {
    logger.error(requestId, "clients_list_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
