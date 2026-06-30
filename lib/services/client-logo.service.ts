import * as clientLogoRepository from "@/lib/repositories/client-logo.repository";
import type { ClientLogoCreateInput } from "@/lib/validators/client-logo";
import { deleteImage } from "@/lib/storage";
import { logger, newRequestId } from "@/lib/logger";

export function listClientLogos() {
  return clientLogoRepository.findAllClientLogos();
}

export function createClientLogo(data: ClientLogoCreateInput) {
  return clientLogoRepository.createClientLogo(data);
}

export function getClientLogoById(id: string) {
  return clientLogoRepository.findClientLogoById(id);
}

/**
 * Deletes a client logo, then best-effort deletes its Cloudinary image
 * afterwards (fire-and-forget — a Cloudinary failure never blocks the DB
 * delete, which has already succeeded by the time this runs).
 */
export async function deleteClientLogo(id: string) {
  const existing = await clientLogoRepository.findClientLogoById(id);
  const deleted = await clientLogoRepository.deleteClientLogo(id);

  if (existing?.imagePublicId) {
    deleteImage(existing.imagePublicId).catch((error) => {
      logger.warn(newRequestId(), "client_logo_image_cleanup_failed", {
        publicId: existing.imagePublicId,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    });
  }

  return deleted;
}
