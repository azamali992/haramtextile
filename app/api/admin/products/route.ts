import { NextRequest } from "next/server";
import { ok, created, validationError, unauthenticated, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { productCreateSchema } from "@/lib/validators/product";
import { listProducts, createProduct } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

/** GET /api/admin/products - admin listing (same filters as the public route). */
export async function GET(request: NextRequest) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    const { products, total } = await listProducts({ category, search });
    return ok(products, { total });
  } catch (error) {
    logger.error(requestId, "admin_products_list_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** POST /api/admin/products - creates a new product. */
export async function POST(request: NextRequest) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const body = await request.json().catch(() => null);
    if (body === null) {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid product payload.", parsed.error.flatten());
    }

    const product = await createProduct(parsed.data);
    return created(product);
  } catch (error) {
    logger.error(requestId, "admin_product_create_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
