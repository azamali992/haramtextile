import { ok, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { listSubmissions } from "@/lib/services/contact.service";

export const dynamic = "force-dynamic";

/** GET /api/admin/submissions — lists all contact form submissions, newest first. */
export async function GET() {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const submissions = await listSubmissions();
    return ok(submissions, { total: submissions.length });
  } catch (error) {
    logger.error(requestId, "admin_submissions_list_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
