"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { ConfirmDeleteButton } from "../../_components/ConfirmDeleteButton";
import { CertificationFormModal } from "./CertificationFormModal";

export interface AdminCertification {
  id: string;
  name: string;
  description: string | null;
  issuingBody: string | null;
  imageUrl: string;
  imagePublicId: string;
  pdfUrl: string | null;
  pdfPublicId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface CertificationsClientProps {
  initialCertifications: AdminCertification[];
}

export function CertificationsClient({ initialCertifications }: CertificationsClientProps) {
  const [certifications, setCertifications] = useState<AdminCertification[]>(initialCertifications);
  const [editing, setEditing] = useState<AdminCertification | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setListError(null);
    try {
      await adminFetch<void>(`/api/admin/certifications/${id}`, { method: "DELETE" });
      setCertifications((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setListError(err instanceof AdminApiError ? err.message : "Failed to delete certification.");
    }
  }

  function handleSaved(certification: AdminCertification) {
    setCertifications((prev) => {
      const exists = prev.some((c) => c.id === certification.id);
      return exists
        ? prev.map((c) => (c.id === certification.id ? certification : c))
        : [certification, ...prev];
    });
    setEditing(null);
    setIsCreating(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-warm">
          {certifications.length} certification{certifications.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light"
        >
          Add certification
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
              <th className="px-4 py-3 font-medium">Issuing body</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-dark">
            {certifications.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-warm">
                  No certifications yet. Click &ldquo;Add certification&rdquo; to create the first one.
                </td>
              </tr>
            ) : (
              certifications.map((certification) => (
                <tr key={certification.id} className="divide-x divide-cream-dark">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary thumbnail in an admin table */}
                    <img
                      src={certification.imageUrl}
                      alt={certification.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-3">{certification.name}</td>
                  <td className="px-4 py-3">{certification.issuingBody ?? "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(certification)}
                        className="rounded px-2 py-1 font-medium text-green-primary hover:bg-cream-dark"
                      >
                        Edit
                      </button>
                      <ConfirmDeleteButton onConfirm={() => handleDelete(certification.id)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(isCreating || editing) && (
        <CertificationFormModal
          initialValues={editing ?? undefined}
          onClose={() => {
            setIsCreating(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
