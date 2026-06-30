"use client";

import { useRef, useState } from "react";
import { uploadAdminImage } from "@/lib/admin/api-client";

interface ImageUploadFieldProps {
  label: string;
  imageUrl: string | null;
  onChange: (result: { url: string; imagePublicId: string }) => void;
  required?: boolean;
}

/**
 * File picker that immediately uploads the selected image via
 * `/api/admin/upload` and reports back `{ url, imagePublicId }`. Shows a
 * preview thumbnail and an inline upload-in-progress / error state.
 */
export function ImageUploadField({ label, imageUrl, onChange, required }: ImageUploadFieldProps) {
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
      const result = await uploadAdminImage(file);
      onChange(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
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

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview of a remote Cloudinary URL, not worth Image config here
        <img
          src={imageUrl}
          alt="Current upload preview"
          className="h-32 w-32 rounded border border-cream-dark object-cover"
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          handleFileChange(e).catch(() => {
            setError("Image upload failed.");
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
