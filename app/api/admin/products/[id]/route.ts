import { NextRequest } from "next/server";
import {
  ok,
  noContent,
  notFound,
  validationError,
  unauthenticated,
  internalError,
} from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { requireAdminSession } from "@/lib/require-admin";
import { productUpdateSchema } from "@/lib/validators/product";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** GET /api/admin/products/[id] */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const product = await getProductById(params.id);
    if (!product) {
      return notFound("Product not found.");
    }
    return ok(product);
  } catch (error) {
    logger.error(requestId, "admin_product_get_failed", {
      productId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** PUT /api/admin/products/[id] */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getProductById(params.id);
    if (!existing) {
      return notFound("Product not found.");
    }

    const body = await request.json().catch(() => null);
    if (body === null) {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Invalid product payload.", parsed.error.flatten());
    }

    const product = await updateProduct(params.id, parsed.data);
    return ok(product);
  } catch (error) {
    logger.error(requestId, "admin_product_update_failed", {
      productId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}

/** DELETE /api/admin/products/[id] */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const requestId = newRequestId();

  const session = await requireAdminSession();
  if (!session) {
    return unauthenticated();
  }

  try {
    const existing = await getProductById(params.id);
    if (!existing) {
      return notFound("Product not found.");
    }

    await deleteProduct(params.id);
    return noContent();
  } catch (error) {
    logger.error(requestId, "admin_product_delete_failed", {
      productId: params.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
