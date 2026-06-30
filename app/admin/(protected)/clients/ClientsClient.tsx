"use client";

import { useState } from "react";
import { adminFetch, AdminApiError, uploadAdminImage } from "@/lib/admin/api-client";
import { ConfirmDeleteButton } from "../../_components/ConfirmDeleteButton";
import { FormFeedback } from "../../_components/FormFeedback";

export interface AdminClientLogo {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  altText: string;
  order: number;
  createdAt: string | Date;
}

interface ClientsClientProps {
  initialLogos: AdminClientLogo[];
}

/** Logo grid with an upload-new form (image + alt text) and per-logo delete. */
export function ClientsClient({ initialLogos }: ClientsClientProps) {
  const [logos, setLogos] = useState<AdminClientLogo[]>(initialLogos);
  const [altText, setAltText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorDetails(undefined);

    if (!pendingFile) {
      setError("Please choose a logo image to upload.");
      return;
    }
    if (!altText.trim()) {
      setError("Alt text is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { url, imagePublicId } = await uploadAdminImage(pendingFile);
      const logo = await adminFetch<AdminClientLogo>("/api/admin/clients", {
        method: "POST",
        body: JSON.stringify({
          imageUrl: url,
          imagePublicId,
          altText: altText.trim(),
          order: logos.length,
        }),
      });
      setLogos((prev) => [...prev, logo]);
      setAltText("");
      setPendingFile(null);
      const fileInput = document.getElementById("client-logo-file") as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setErrorDetails(err.details);
      } else {
        setError("Failed to add client logo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await adminFetch<void>(`/api/admin/clients/${id}`, { method: "DELETE" });
      setLogos((prev) => prev.filter((logo) => logo.id !== id));
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Failed to delete client logo.");
    }
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          handleAdd(e).catch(() => {
            setError("Failed to add client logo.");
            setIsSubmitting(false);
          });
        }}
        className="mb-6 flex flex-col gap-3 rounded border border-cream-dark bg-cream-off p-4 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="client-logo-file" className="text-sm font-medium">
            Logo image
          </label>
          <input
            id="client-logo-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="altText" className="text-sm font-medium">
            Alt text <span className="text-red-700">*</span>
          </label>
          <input
            id="altText"
            required
            maxLength={200}
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light disabled:opacity-60"
        >
          {isSubmitting ? "Uploading…" : "Add logo"}
        </button>
      </form>

      <FormFeedback message={error} details={errorDetails} />

      {logos.length === 0 ? (
        <p className="mt-4 text-gray-warm">No client logos yet. Add the first one above.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="flex flex-col items-center gap-2 rounded border border-cream-dark bg-cream-off p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary logo in an admin grid */}
              <img src={logo.imageUrl} alt={logo.altText} className="h-16 w-full object-contain" />
              <p className="text-center text-xs text-gray-warm">{logo.altText}</p>
              <ConfirmDeleteButton onConfirm={() => handleDelete(logo.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
