import * as productRepository from "@/lib/repositories/product.repository";
import type { ProductCreateInput, ProductUpdateInput } from "@/lib/validators/product";
import { deleteImage } from "@/lib/storage";
import { logger, newRequestId } from "@/lib/logger";

export interface ListProductsParams {
  category?: string;
  search?: string;
}

export async function listProducts(params: ListProductsParams) {
  const filters = { categorySlug: params.category, search: params.search };
  const [products, total] = await Promise.all([
    productRepository.findManyProducts(filters),
    productRepository.countProducts(filters),
  ]);
  return { products, total };
}

export function getProductById(id: string) {
  return productRepository.findProductById(id);
}

export function createProduct(data: ProductCreateInput) {
  return productRepository.createProduct(data);
}

/**
 * Updates a product. If the image is being replaced (`imagePublicId`
 * differs from the existing row), the old Cloudinary asset is deleted
 * afterwards on a best-effort basis — fire-and-forget, wrapped so a
 * Cloudinary failure never blocks or fails the DB update itself.
 */
export async function updateProduct(id: string, data: ProductUpdateInput) {
  const existing =
    data.imagePublicId !== undefined ? await productRepository.findProductById(id) : null;

  const updated = await productRepository.updateProduct(id, data);

  if (existing && data.imagePublicId && existing.imagePublicId !== data.imagePublicId) {
    void cleanupOldImage(existing.imagePublicId);
  }

  return updated;
}

/**
 * Deletes a product, then best-effort deletes its Cloudinary image
 * afterwards (fire-and-forget — a Cloudinary failure never blocks the DB
 * delete, which has already succeeded by the time this runs).
 */
export async function deleteProduct(id: string) {
  const existing = await productRepository.findProductById(id);
  const deleted = await productRepository.deleteProduct(id);

  if (existing?.imagePublicId) {
    void cleanupOldImage(existing.imagePublicId);
  }

  return deleted;
}

/** Best-effort Cloudinary cleanup: log and swallow any failure. */
function cleanupOldImage(publicId: string): void {
  deleteImage(publicId).catch((error) => {
    logger.warn(newRequestId(), "product_image_cleanup_failed", {
      publicId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  });
}
