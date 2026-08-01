"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { Modal } from "../../_components/Modal";
import { FormFeedback } from "../../_components/FormFeedback";
import { ImageUploadField } from "../../_components/ImageUploadField";
import type { AdminProductionStep, AdminProductionStepImage } from "./ProductionStepsClient";

interface ProductionStepFormValues {
  title: string;
  slug: string;
  description: string;
  statLabel: string;
  statValue: string;
  imageUrl: string;
  imagePublicId: string;
}

interface ProductionStepFormModalProps {
  initialValues?: AdminProductionStep;
  onClose: () => void;
  onSaved: (productionStep: AdminProductionStep) => void;
  onGalleryChange?: (stepId: string, galleryImages: AdminProductionStepImage[]) => void;
}

function toFormValues(productionStep?: AdminProductionStep): ProductionStepFormValues {
  return {
    title: productionStep?.title ?? "",
    slug: productionStep?.slug ?? "",
    description: productionStep?.description ?? "",
    statLabel: productionStep?.statLabel ?? "",
    statValue: productionStep?.statValue ?? "",
    imageUrl: productionStep?.imageUrl ?? "",
    imagePublicId: productionStep?.imagePublicId ?? "",
  };
}

/** Lowercase + hyphenate a title into a slug fallback, e.g. "Dyeing & Finishing" -> "dyeing-finishing". */
function deriveSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Create/edit modal form for a single production step. */
export function ProductionStepFormModal({
  initialValues,
  onClose,
  onSaved,
  onGalleryChange,
}: ProductionStepFormModalProps) {
  const isEditing = Boolean(initialValues);
  const [values, setValues] = useState<ProductionStepFormValues>(toFormValues(initialValues));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);

  const [galleryImages, setGalleryImages] = useState<AdminProductionStepImage[]>(
    initialValues?.galleryImages ?? [],
  );
  const [galleryUploadKey, setGalleryUploadKey] = useState(0);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  async function handleAddGalleryImage(result: { url: string; imagePublicId: string }) {
    if (!initialValues) return;
    setGalleryError(null);
    setIsAddingImage(true);
    try {
      const image = await adminFetch<AdminProductionStepImage>(
        `/api/admin/production-steps/${initialValues.id}/images`,
        {
          method: "POST",
          body: JSON.stringify({ imageUrl: result.url, imagePublicId: result.imagePublicId }),
        },
      );
      setGalleryImages((prev) => {
        const next = [...prev, image];
        onGalleryChange?.(initialValues.id, next);
        return next;
      });
    } catch (err) {
      setGalleryError(err instanceof AdminApiError ? err.message : "Failed to add gallery image.");
    } finally {
      setIsAddingImage(false);
      setGalleryUploadKey((k) => k + 1);
    }
  }

  async function handleRemoveGalleryImage(imageId: string) {
    if (!initialValues) return;
    setGalleryError(null);
    try {
      await adminFetch<void>(
        `/api/admin/production-steps/${initialValues.id}/images/${imageId}`,
        { method: "DELETE" },
      );
      setGalleryImages((prev) => {
        const next = prev.filter((img) => img.id !== imageId);
        onGalleryChange?.(initialValues.id, next);
        return next;
      });
    } catch (err) {
      setGalleryError(
        err instanceof AdminApiError ? err.message : "Failed to remove gallery image.",
      );
    }
  }

  function update<K extends keyof ProductionStepFormValues>(
    key: K,
    value: ProductionStepFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSlugBlur() {
    if (values.slug.trim() === "" && values.title.trim() !== "") {
      update("slug", deriveSlug(values.title));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorDetails(undefined);

    if (!values.imageUrl || !values.imagePublicId) {
      setError("Please upload an image before saving.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: values.title,
      slug: values.slug,
      description: values.description,
      statLabel: values.statLabel || null,
      statValue: values.statValue || null,
      imageUrl: values.imageUrl,
      imagePublicId: values.imagePublicId,
    };

    try {
      const productionStep = await adminFetch<AdminProductionStep>(
        isEditing
          ? `/api/admin/production-steps/${initialValues!.id}`
          : "/api/admin/production-steps",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      onSaved(productionStep);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setErrorDetails(err.details);
      } else {
        setError("Failed to save production step.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={isEditing ? "Edit production step" : "Add production step"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          handleSubmit(e).catch(() => {
            setError("Failed to save production step.");
            setIsSubmitting(false);
          });
        }}
        className="flex flex-col gap-5"
      >
        <FormFeedback message={error} details={errorDetails} />

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-700">*</span>
            </label>
            <input
              id="title"
              required
              maxLength={200}
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="slug" className="text-sm font-medium">
              Slug <span className="text-red-700">*</span>
            </label>
            <input
              id="slug"
              required
              value={values.slug}
              onChange={(e) => update("slug", e.target.value)}
              onBlur={handleSlugBlur}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
            <p className="text-xs text-gray-warm">lowercase-with-hyphens, e.g. dyeing</p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-700">*</span>
            </label>
            <textarea
              id="description"
              required
              maxLength={5000}
              rows={4}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <div className="flex flex-col gap-2 rounded border border-cream-dark p-3">
            <h3 className="text-sm font-medium text-brown-deep">Stat callout (optional)</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="statLabel" className="text-sm font-medium">
                  Stat label
                </label>
                <input
                  id="statLabel"
                  maxLength={100}
                  placeholder="Sewing machines"
                  value={values.statLabel}
                  onChange={(e) => update("statLabel", e.target.value)}
                  className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="statValue" className="text-sm font-medium">
                  Stat value
                </label>
                <input
                  id="statValue"
                  maxLength={100}
                  placeholder="160"
                  value={values.statValue}
                  onChange={(e) => update("statValue", e.target.value)}
                  className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
                />
              </div>
            </div>
          </div>

          <ImageUploadField
            label="Production step image"
            imageUrl={values.imageUrl || null}
            required
            onChange={({ url, imagePublicId }) => {
              update("imageUrl", url);
              update("imagePublicId", imagePublicId);
            }}
          />

          <div className="flex flex-col gap-2 rounded border border-cream-dark p-3">
            <h3 className="text-sm font-medium text-brown-deep">
              Gallery photos (optional, 3-4 recommended)
            </h3>

            {isEditing ? (
              <>
                {galleryImages.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {galleryImages.map((img) => (
                      <div key={img.id} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of a remote Cloudinary URL */}
                        <img
                          src={img.imageUrl}
                          alt=""
                          className="h-20 w-20 rounded border border-cream-dark object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(img.id)}
                          aria-label="Remove gallery image"
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-700 text-xs font-medium text-white hover:bg-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <ImageUploadField
                  key={galleryUploadKey}
                  label="Add a gallery photo"
                  imageUrl={null}
                  onChange={(result) => {
                    handleAddGalleryImage(result).catch(() =>
                      setGalleryError("Failed to add gallery image."),
                    );
                  }}
                />
                {isAddingImage && <p className="text-xs text-gray-warm">Adding photo…</p>}
                {galleryError && <p className="text-xs text-red-700">{galleryError}</p>}
              </>
            ) : (
              <p className="text-xs text-gray-warm">
                Save this production step first, then reopen it here to add gallery photos.
              </p>
            )}
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
