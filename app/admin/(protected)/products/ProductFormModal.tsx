"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { Modal } from "../../_components/Modal";
import { FormFeedback } from "../../_components/FormFeedback";
import { ImageUploadField } from "../../_components/ImageUploadField";
import type { AdminCategory, AdminProduct } from "./ProductsClient";

export interface ProductFormValues {
  name: string;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  moq: string;
  fabricType: string;
  tags: string[];
  categoryId: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
}

interface ProductFormModalProps {
  categories: AdminCategory[];
  initialValues?: AdminProduct;
  onClose: () => void;
  onSaved: (product: AdminProduct) => void;
}

function toFormValues(product?: AdminProduct): ProductFormValues {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    imageUrl: product?.imageUrl ?? "",
    imagePublicId: product?.imagePublicId ?? "",
    moq: product?.moq ?? "",
    fabricType: product?.fabricType ?? "",
    tags: product?.tags ?? [],
    categoryId: product?.categoryId ?? "",
    seoTitle: product?.seoTitle ?? "",
    seoDescription: product?.seoDescription ?? "",
    focusKeyword: product?.focusKeyword ?? "",
  };
}

/** Create/edit modal form for a single product, with a core-fields and an SEO-fields section. */
export function ProductFormModal({
  categories,
  initialValues,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const isEditing = Boolean(initialValues);
  const [values, setValues] = useState<ProductFormValues>(toFormValues(initialValues));
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !values.tags.includes(tag)) {
      update("tags", [...values.tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    update("tags", values.tags.filter((t) => t !== tag));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorDetails(undefined);

    if (!values.imageUrl || !values.imagePublicId) {
      setError("Please upload a product image before saving.");
      return;
    }
    if (!values.categoryId) {
      setError("Please select a category.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: values.name,
      description: values.description || null,
      imageUrl: values.imageUrl,
      imagePublicId: values.imagePublicId,
      moq: values.moq || null,
      fabricType: values.fabricType || null,
      tags: values.tags,
      categoryId: values.categoryId,
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
      focusKeyword: values.focusKeyword || null,
    };

    try {
      const product = await adminFetch<AdminProduct>(
        isEditing ? `/api/admin/products/${initialValues!.id}` : "/api/admin/products",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      onSaved(product);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setErrorDetails(err.details);
      } else {
        setError("Failed to save product.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={isEditing ? "Edit product" : "Add product"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          handleSubmit(e).catch(() => {
            setError("Failed to save product.");
            setIsSubmitting(false);
          });
        }}
        className="flex flex-col gap-5"
      >
        <FormFeedback message={error} details={errorDetails} />

        <section className="flex flex-col gap-3">
          <h3 className="font-medium text-brown-deep">Core details</h3>

          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-red-700">*</span>
            </label>
            <input
              id="name"
              required
              maxLength={200}
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="categoryId" className="text-sm font-medium">
              Category <span className="text-red-700">*</span>
            </label>
            <select
              id="categoryId"
              required
              value={values.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            >
              <option value="" disabled>
                Select a category…
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              maxLength={5000}
              rows={3}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <ImageUploadField
            label="Product image"
            imageUrl={values.imageUrl || null}
            required
            onChange={({ url, imagePublicId }) => {
              update("imageUrl", url);
              update("imagePublicId", imagePublicId);
            }}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="moq" className="text-sm font-medium">
                MOQ
              </label>
              <input
                id="moq"
                maxLength={200}
                value={values.moq}
                onChange={(e) => update("moq", e.target.value)}
                className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="fabricType" className="text-sm font-medium">
                Fabric type
              </label>
              <input
                id="fabricType"
                maxLength={200}
                value={values.fabricType}
                onChange={(e) => update("fabricType", e.target.value)}
                className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="tagInput" className="text-sm font-medium">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type a tag and press Enter"
                className="flex-1 rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded border border-cream-dark px-3 py-2 font-medium text-green-primary hover:bg-cream-dark"
              >
                Add
              </button>
            </div>
            {values.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-2">
                {values.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded bg-cream-dark px-2 py-1 text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="text-gray-warm hover:text-red-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3 border-t border-cream-dark pt-4">
          <h3 className="font-medium text-brown-deep">SEO</h3>

          <div className="flex flex-col gap-1">
            <label htmlFor="seoTitle" className="text-sm font-medium">
              SEO title
            </label>
            <input
              id="seoTitle"
              maxLength={70}
              value={values.seoTitle}
              onChange={(e) => update("seoTitle", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="seoDescription" className="text-sm font-medium">
              Meta description
            </label>
            <textarea
              id="seoDescription"
              maxLength={160}
              rows={2}
              value={values.seoDescription}
              onChange={(e) => update("seoDescription", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="focusKeyword" className="text-sm font-medium">
              Focus keyword
            </label>
            <input
              id="focusKeyword"
              maxLength={100}
              value={values.focusKeyword}
              onChange={(e) => update("focusKeyword", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>
        </section>

        <div className="flex justify-end gap-2 border-t border-cream-dark pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-4 py-2 font-medium text-gray-warm hover:bg-cream-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
