import { NextRequest } from "next/server";
import { ok, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { listProducts } from "@/lib/services/product.service";

// DB-backed and admin-editable - never statically cache at build time.
export const dynamic = "force-dynamic";

/**
 * GET /api/products
 * Public listing of all products. Supports `?category=<slug>` and
 * `?search=<text>` query filters.
 */
export async function GET(request: NextRequest) {
  const requestId = newRequestId();
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    const { products, total } = await listProducts({ category, search });

    const data = products.map((product) => ({
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
    }));

    return ok(data, { total });
  } catch (error) {
    logger.error(requestId, "products_list_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
