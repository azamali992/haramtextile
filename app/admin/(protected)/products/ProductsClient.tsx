"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { ConfirmDeleteButton } from "../../_components/ConfirmDeleteButton";
import { ProductFormModal, type ProductFormValues } from "./ProductFormModal";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
}

/** Shape returned by `listProducts`/`getProductById` (product + included category). */
export interface AdminProduct {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
  imagePublicId: string;
  moq: string | null;
  fabricType: string | null;
  tags: string[];
  categoryId: string;
  category: AdminCategory;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ProductsClientProps {
  initialProducts: AdminProduct[];
  categories: AdminCategory[];
}

export function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setListError(null);
    try {
      await adminFetch<void>(`/api/admin/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setListError(err instanceof AdminApiError ? err.message : "Failed to delete product.");
    }
  }

  function handleSaved(product: AdminProduct) {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.map((p) => (p.id === product.id ? product : p)) : [product, ...prev];
    });
    setEditingProduct(null);
    setIsCreating(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-warm">{products.length} product{products.length === 1 ? "" : "s"}</p>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light"
        >
          Add product
        </button>
      </div>

      {listError && (
        <p role="alert" className="mb-3 rounded border border-red-700 bg-red-50 px-3 py-2 text-red-800">
          {listError}
        </p>
      )}

      <div className="overflow-x-auto rounded border border-cream-dark bg-cream-off">
        <table className="w-full text-left">
          <thead>
            <tr className="divide-x divide-cream-dark border-b border-cream-dark text-gray-warm">
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">MOQ</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-dark">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-warm">
                  No products yet. Click &ldquo;Add product&rdquo; to create the first one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="divide-x divide-cream-dark">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary thumbnail in an admin table */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.category.name}</td>
                  <td className="px-4 py-3">{product.moq ?? "—"}</td>
                  <td className="px-4 py-3">{product.tags.join(", ") || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(product)}
                        className="rounded px-2 py-1 font-medium text-green-primary hover:bg-cream-dark"
                      >
                        Edit
                      </button>
                      <ConfirmDeleteButton onConfirm={() => handleDelete(product.id)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(isCreating || editingProduct) && (
        <ProductFormModal
          categories={categories}
          initialValues={editingProduct ?? undefined}
          onClose={() => {
            setIsCreating(false);
            setEditingProduct(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export type { ProductFormValues };
