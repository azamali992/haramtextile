import * as aboutContentRepository from "@/lib/repositories/about-content.repository";
import type { AboutContentUpdateInput } from "@/lib/validators/about-content";
import { deleteImage } from "@/lib/storage";
import { logger, newRequestId } from "@/lib/logger";

export function getAboutContent() {
  return aboutContentRepository.findAboutContent();
}

/**
 * Saves the singleton about-content row. If the image is being replaced
 * (`imagePublicId` differs from the existing row), the old Cloudinary
 * asset is deleted afterwards on a best-effort basis - fire-and-forget,
 * wrapped so a Cloudinary failure never blocks or fails the save.
 */
export async function saveAboutContent(data: AboutContentUpdateInput) {
  const existing =
    data.imagePublicId !== undefined ? await aboutContentRepository.findAboutContent() : null;

  const updated = await aboutContentRepository.upsertAboutContent(data);

  if (existing?.imagePublicId && data.imagePublicId && existing.imagePublicId !== data.imagePublicId) {
    deleteImage(existing.imagePublicId).catch((error) => {
      logger.warn(newRequestId(), "about_content_image_cleanup_failed", {
        publicId: existing.imagePublicId,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    });
  }

  return updated;
}
