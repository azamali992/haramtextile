"use client";

import { useRef, useState } from "react";
import { uploadAdminPdf } from "@/lib/admin/api-client";

interface PdfUploadFieldProps {
  label: string;
  pdfUrl: string | null;
  onChange: (result: { url: string; pdfPublicId: string }) => void;
  required?: boolean;
}

/**
 * File picker that immediately uploads the selected PDF via
 * `/api/admin/upload` (kind=pdf) and reports back `{ url, pdfPublicId }`.
 * Shows a "View current PDF" link and an inline upload/error state.
 */
export function PdfUploadField({ label, pdfUrl, onChange, required }: PdfUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const result = await uploadAdminPdf(file);
      onChange(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-brown-deep">
        {label}
        {required && <span className="text-red-700"> *</span>}
      </label>

      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 rounded border border-cream-dark bg-cream-off px-3 py-1.5 text-sm font-medium text-green-primary hover:bg-cream-dark"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          View current PDF
        </a>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          handleFileChange(e).catch(() => {
            setError("PDF upload failed.");
            setIsUploading(false);
          });
        }}
        disabled={isUploading}
        className="text-sm text-brown-deep file:mr-3 file:rounded file:border file:border-cream-dark file:bg-cream-off file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-green-primary hover:file:bg-cream-dark disabled:opacity-60"
      />

      {isUploading && <p className="text-xs text-gray-warm">Uploading…</p>}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
