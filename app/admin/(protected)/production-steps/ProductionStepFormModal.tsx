"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { Modal } from "../../_components/Modal";
import { FormFeedback } from "../../_components/FormFeedback";
import { ImageUploadField } from "../../_components/ImageUploadField";
import type { AdminProductionStep } from "./ProductionStepsClient";

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
}: ProductionStepFormModalProps) {
  const isEditing = Boolean(initialValues);
  const [values, setValues] = useState<ProductionStepFormValues>(toFormValues(initialValues));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);

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
