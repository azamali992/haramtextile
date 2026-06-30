import { ok, notFound, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { getProductById } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

/**
 * Strips internal-only fields (e.g. the Cloudinary `imagePublicId`) before a
 * product record is sent to a public client. Keep in sync with the mapping
 * in `app/api/products/route.ts`.
 */
function toPublicProduct(product: Awaited<ReturnType<typeof getProductById>>) {
  if (!product) return product;
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    moq: product.moq,
    fabricType: product.fabricType,
    tags: product.tags,
    category: product.category,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    focusKeyword: product.focusKeyword,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * GET /api/products/[id]
 * Public single-product lookup. Returns 404 if the product doesn't exist.
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const requestId = newRequestId();
  try {
    const product = await getProductById(params.id);

    if (!product) {
      return notFound("Product not found.");
    }

    return ok(toPublicProduct(product));
  } catch (error) {
    logger.error(requestId, "product_get_failed", {
      productId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
