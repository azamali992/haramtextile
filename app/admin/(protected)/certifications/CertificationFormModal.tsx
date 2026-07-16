"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { Modal } from "../../_components/Modal";
import { FormFeedback } from "../../_components/FormFeedback";
import { ImageUploadField } from "../../_components/ImageUploadField";
import { PdfUploadField } from "../../_components/PdfUploadField";
import type { AdminCertification } from "./CertificationsClient";

interface CertificationFormValues {
  name: string;
  description: string;
  issuingBody: string;
  imageUrl: string;
  imagePublicId: string;
  pdfUrl: string;
  pdfPublicId: string;
  seoTitle: string;
  seoDescription: string;
}

interface CertificationFormModalProps {
  initialValues?: AdminCertification;
  onClose: () => void;
  onSaved: (certification: AdminCertification) => void;
}

function toFormValues(certification?: AdminCertification): CertificationFormValues {
  return {
    name: certification?.name ?? "",
    description: certification?.description ?? "",
    issuingBody: certification?.issuingBody ?? "",
    imageUrl: certification?.imageUrl ?? "",
    imagePublicId: certification?.imagePublicId ?? "",
    pdfUrl: certification?.pdfUrl ?? "",
    pdfPublicId: certification?.pdfPublicId ?? "",
    seoTitle: certification?.seoTitle ?? "",
    seoDescription: certification?.seoDescription ?? "",
  };
}

/** Create/edit modal form for a single certification. */
export function CertificationFormModal({
  initialValues,
  onClose,
  onSaved,
}: CertificationFormModalProps) {
  const isEditing = Boolean(initialValues);
  const [values, setValues] = useState<CertificationFormValues>(toFormValues(initialValues));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);

  function update<K extends keyof CertificationFormValues>(
    key: K,
    value: CertificationFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
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
      name: values.name,
      description: values.description || null,
      issuingBody: values.issuingBody || null,
      imageUrl: values.imageUrl,
      imagePublicId: values.imagePublicId,
      pdfUrl: values.pdfUrl || null,
      pdfPublicId: values.pdfPublicId || null,
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
    };

    try {
      const certification = await adminFetch<AdminCertification>(
        isEditing
          ? `/api/admin/certifications/${initialValues!.id}`
          : "/api/admin/certifications",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      onSaved(certification);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setErrorDetails(err.details);
      } else {
        setError("Failed to save certification.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={isEditing ? "Edit certification" : "Add certification"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          handleSubmit(e).catch(() => {
            setError("Failed to save certification.");
            setIsSubmitting(false);
          });
        }}
        className="flex flex-col gap-5"
      >
        <FormFeedback message={error} details={errorDetails} />

        <section className="flex flex-col gap-3">
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
            <label htmlFor="issuingBody" className="text-sm font-medium">
              Issuing body
            </label>
            <input
              id="issuingBody"
              maxLength={200}
              value={values.issuingBody}
              onChange={(e) => update("issuingBody", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
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
            label="Certification image"
            imageUrl={values.imageUrl || null}
            required
            onChange={({ url, imagePublicId }) => {
              update("imageUrl", url);
              update("imagePublicId", imagePublicId);
            }}
          />

          <PdfUploadField
            label="Certificate PDF"
            pdfUrl={values.pdfUrl || null}
            onChange={({ url, pdfPublicId }) => {
              update("pdfUrl", url);
              update("pdfPublicId", pdfPublicId);
            }}
          />
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
