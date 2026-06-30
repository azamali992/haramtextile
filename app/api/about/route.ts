import { ok, notFound, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { getAboutContent } from "@/lib/services/about-content.service";

// DB-backed and admin-editable — never statically cache at build time.
export const dynamic = "force-dynamic";

/** Strips internal-only fields (e.g. the Cloudinary `imagePublicId`) before sending to a public client. */
function toPublicAboutContent(about: Awaited<ReturnType<typeof getAboutContent>>) {
  if (!about) return about;
  return {
    storyText: about.storyText,
    missionText: about.missionText,
    imageUrl: about.imageUrl,
    updatedAt: about.updatedAt,
  };
}

/** GET /api/about — public lookup of the current About page content. */
export async function GET() {
  const requestId = newRequestId();
  try {
    const about = await getAboutContent();

    if (!about) {
      return notFound("About content has not been set up yet.");
    }

    return ok(toPublicAboutContent(about));
  } catch (error) {
    logger.error(requestId, "about_get_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
