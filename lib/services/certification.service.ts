import * as certificationRepository from "@/lib/repositories/certification.repository";
import type {
  CertificationCreateInput,
  CertificationUpdateInput,
} from "@/lib/validators/certification";
import { deleteImage } from "@/lib/storage";
import { logger, newRequestId } from "@/lib/logger";

export function listCertifications() {
  return certificationRepository.findAllCertifications();
}

export function getCertificationById(id: string) {
  return certificationRepository.findCertificationById(id);
}

export function createCertification(data: CertificationCreateInput) {
  return certificationRepository.createCertification(data);
}

/**
 * Updates a certification. If the image is being replaced
 * (`imagePublicId` differs from the existing row), the old Cloudinary
 * asset is deleted afterwards on a best-effort basis - fire-and-forget,
 * wrapped so a Cloudinary failure never blocks or fails the DB update.
 */
export async function updateCertification(id: string, data: CertificationUpdateInput) {
  const existing =
    data.imagePublicId !== undefined || data.pdfPublicId !== undefined
      ? await certificationRepository.findCertificationById(id)
      : null;

  const updated = await certificationRepository.updateCertification(id, data);

  if (existing && data.imagePublicId && existing.imagePublicId !== data.imagePublicId) {
    void cleanupOldAsset(existing.imagePublicId, "image");
  }
  if (
    existing?.pdfPublicId &&
    data.pdfPublicId !== undefined &&
    existing.pdfPublicId !== data.pdfPublicId
  ) {
    void cleanupOldAsset(existing.pdfPublicId, "raw");
  }

  return updated;
}

/**
 * Deletes a certification, then best-effort deletes its Cloudinary image
 * afterwards (fire-and-forget - a Cloudinary failure never blocks the DB
 * delete, which has already succeeded by the time this runs).
 */
export async function deleteCertification(id: string) {
  const existing = await certificationRepository.findCertificationById(id);
  const deleted = await certificationRepository.deleteCertification(id);

  if (existing?.imagePublicId) {
    void cleanupOldAsset(existing.imagePublicId, "image");
  }
  if (existing?.pdfPublicId) {
    void cleanupOldAsset(existing.pdfPublicId, "raw");
  }

  return deleted;
}

/** Best-effort Cloudinary cleanup: log and swallow any failure. */
function cleanupOldAsset(publicId: string, resourceType: "image" | "raw"): void {
  deleteImage(publicId, resourceType).catch((error) => {
    logger.warn(newRequestId(), "certification_asset_cleanup_failed", {
      publicId,
      resourceType,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  });
}
