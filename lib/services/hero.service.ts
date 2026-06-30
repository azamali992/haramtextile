import * as heroRepository from "@/lib/repositories/hero.repository";
import type { HeroUpdateInput } from "@/lib/validators/hero";
import { deleteImage } from "@/lib/storage";
import { logger, newRequestId } from "@/lib/logger";

export function getHeroConfig() {
  return heroRepository.findHeroConfig();
}

/**
 * Saves the singleton hero config. If the image is being replaced
 * (`imagePublicId` differs from the existing row), the old Cloudinary
 * asset is deleted afterwards on a best-effort basis — fire-and-forget,
 * wrapped so a Cloudinary failure never blocks or fails the save.
 */
export async function saveHeroConfig(data: HeroUpdateInput) {
  const existing =
    data.imagePublicId !== undefined ? await heroRepository.findHeroConfig() : null;

  const updated = await heroRepository.upsertHeroConfig(data);

  if (existing?.imagePublicId && data.imagePublicId && existing.imagePublicId !== data.imagePublicId) {
    deleteImage(existing.imagePublicId).catch((error) => {
      logger.warn(newRequestId(), "hero_image_cleanup_failed", {
        publicId: existing.imagePublicId,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    });
  }

  return updated;
}
