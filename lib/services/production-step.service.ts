import * as productionStepRepository from "@/lib/repositories/production-step.repository";
import type {
  ProductionStepCreateInput,
  ProductionStepUpdateInput,
} from "@/lib/validators/production-step";
import { deleteImage } from "@/lib/storage";
import { logger, newRequestId } from "@/lib/logger";

export function listProductionSteps() {
  return productionStepRepository.findAllProductionSteps();
}

export function getProductionStepById(id: string) {
  return productionStepRepository.findProductionStepById(id);
}

export function createProductionStep(data: ProductionStepCreateInput) {
  return productionStepRepository.createProductionStep(data);
}

/**
 * Updates a production step. If the image is being replaced
 * (`imagePublicId` differs from the existing row), the old Cloudinary
 * asset is deleted afterwards on a best-effort basis - fire-and-forget,
 * wrapped so a Cloudinary failure never blocks or fails the DB update.
 */
export async function updateProductionStep(id: string, data: ProductionStepUpdateInput) {
  const existing =
    data.imagePublicId !== undefined
      ? await productionStepRepository.findProductionStepById(id)
      : null;

  const updated = await productionStepRepository.updateProductionStep(id, data);

  if (existing && data.imagePublicId && existing.imagePublicId !== data.imagePublicId) {
    void cleanupOldImage(existing.imagePublicId);
  }

  return updated;
}

/**
 * Deletes a production step, then best-effort deletes its Cloudinary image
 * afterwards (fire-and-forget - a Cloudinary failure never blocks the DB
 * delete, which has already succeeded by the time this runs).
 */
export async function deleteProductionStep(id: string) {
  const existing = await productionStepRepository.findProductionStepById(id);
  const deleted = await productionStepRepository.deleteProductionStep(id);

  if (existing?.imagePublicId) {
    void cleanupOldImage(existing.imagePublicId);
  }

  return deleted;
}

export function swapProductionStepOrder(firstId: string, secondId: string) {
  return productionStepRepository.swapProductionStepOrder(firstId, secondId);
}

/** Best-effort Cloudinary cleanup: log and swallow any failure. */
function cleanupOldImage(publicId: string): void {
  deleteImage(publicId).catch((error) => {
    logger.warn(newRequestId(), "production_step_image_cleanup_failed", {
      publicId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  });
}
