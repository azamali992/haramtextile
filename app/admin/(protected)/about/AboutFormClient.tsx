"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { FormFeedback, SuccessBanner } from "../../_components/FormFeedback";
import { ImageUploadField } from "../../_components/ImageUploadField";

export interface AdminAboutContent {
  id: number;
  storyText: string;
  missionText: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  updatedAt: string | Date;
}

interface AboutFormValues {
  storyText: string;
  missionText: string;
  imageUrl: string;
  imagePublicId: string;
}

function toFormValues(about: AdminAboutContent | null): AboutFormValues {
  return {
    storyText: about?.storyText ?? "",
    missionText: about?.missionText ?? "",
    imageUrl: about?.imageUrl ?? "",
    imagePublicId: about?.imagePublicId ?? "",
  };
}

interface AboutFormClientProps {
  initialAbout: AdminAboutContent | null;
}

/**
 * Plain `<textarea>` editor for the About page copy - intentionally NOT a
 * rich text editor, per spec - plus an image swap/upload.
 */
export function AboutFormClient({ initialAbout }: AboutFormClientProps) {
  const [values, setValues] = useState<AboutFormValues>(toFormValues(initialAbout));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof AboutFormValues>(key: K, value: AboutFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorDetails(undefined);
    setSuccess(null);
    setIsSubmitting(true);

    const payload = {
      storyText: values.storyText,
      missionText: values.missionText || null,
      imageUrl: values.imageUrl || null,
      imagePublicId: values.imagePublicId || null,
    };

    try {
      await adminFetch<AdminAboutContent>("/api/admin/about", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSuccess("About content saved.");
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setErrorDetails(err.details);
      } else {
        setError("Failed to save about content.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e).catch(() => {
          setError("Failed to save about content.");
          setIsSubmitting(false);
        });
      }}
      className="flex max-w-2xl flex-col gap-4 rounded border border-cream-dark bg-cream-off p-6"
    >
      <FormFeedback message={error} details={errorDetails} />
      <SuccessBanner message={success} />

      <div className="flex flex-col gap-1">
        <label htmlFor="storyText" className="text-sm font-medium">
          Story text <span className="text-red-700">*</span>
        </label>
        <textarea
          id="storyText"
          required
          maxLength={5000}
          rows={8}
          value={values.storyText}
          onChange={(e) => update("storyText", e.target.value)}
          className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="missionText" className="text-sm font-medium">
          Mission text
        </label>
        <textarea
          id="missionText"
          maxLength={2000}
          rows={5}
          value={values.missionText}
          onChange={(e) => update("missionText", e.target.value)}
          className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
        />
      </div>

      <ImageUploadField
        label="About image"
        imageUrl={values.imageUrl || null}
        onChange={({ url, imagePublicId }) => {
          update("imageUrl", url);
          update("imagePublicId", imagePublicId);
        }}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Save about content"}
      </button>
    </form>
  );
}
