import { NextRequest } from "next/server";
import { created, badRequest, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { handleImageUpload } from "@/lib/services/upload.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/upload
 * Accepts a multipart/form-data file under the `file` field and proxies
 * it to `lib/storage.ts`'s `uploadImage` - the only place in the app
 * permitted to talk to the Cloudinary SDK. Returns the resulting URL and
 * Cloudinary's real public ID.
 *
 * CSRF defense-in-depth: requires a custom `X-Requested-With` header (set
 * by `lib/admin/api-client.ts`'s `uploadAdminImage()`) that a simple
 * cross-site HTML form cannot attach to a multipart request, since custom
 * headers aren't in CORS's safelist. Rejected cheaply, before even checking
 * the session, on top of (not instead of) the `sameSite=lax` session
 * cookie and `requireAdminSession()` check below.
 */
export async function POST(request: NextRequest) {
  const requestId = newRequestId();

  if (request.headers.get("x-requested-with") !== "haram-admin") {
    return badRequest("Missing required request header.");
  }

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return badRequest("Request must be multipart/form-data.");
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return badRequest('A "file" field containing an image is required.');
    }

    const result = await handleImageUpload(file);
    return created(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(requestId, "admin_upload_failed", { message });

    // Validation failures inside uploadImage (bad type/size) are
    // client errors, not server errors.
    if (
      message.includes("Unsupported file type") ||
      message.includes("too large") ||
      message.includes("empty")
    ) {
      return badRequest(message);
    }

    return internalError();
  }
}
