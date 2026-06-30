import { listProducts } from "@/lib/services/product.service";
import { findAllCategories } from "@/lib/repositories/category.repository";
import { ProductsClient } from "./ProductsClient";

export const dynamic = "force-dynamic";

/**
 * Server component: fetches the initial product list and category options
 * directly from the service/repository layer (no network round trip needed
 * since we're already on the server), then hands off to the client
 * component for all interactive table/modal behavior.
 */
export default async function AdminProductsPage() {
  const [{ products }, categories] = await Promise.all([
    listProducts({}),
    findAllCategories(),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl text-brown-deep">Products</h1>
      <ProductsClient initialProducts={products} categories={categories} />
    </div>
  );
}
