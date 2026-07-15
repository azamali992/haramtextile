"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { FormFeedback, SuccessBanner } from "../../_components/FormFeedback";
import { ImageUploadField } from "../../_components/ImageUploadField";

export interface AdminHeroConfig {
  id: number;
  headline: string;
  subtext: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  updatedAt: string | Date;
}

interface HeroFormValues {
  headline: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  imagePublicId: string;
}

function toFormValues(hero: AdminHeroConfig | null): HeroFormValues {
  return {
    headline: hero?.headline ?? "",
    subtext: hero?.subtext ?? "",
    ctaText: hero?.ctaText ?? "",
    ctaLink: hero?.ctaLink ?? "",
    imageUrl: hero?.imageUrl ?? "",
    imagePublicId: hero?.imagePublicId ?? "",
  };
}

interface HeroFormClientProps {
  initialHero: AdminHeroConfig | null;
}

/** Hero config editor with a live preview of how the public hero will render. */
export function HeroFormClient({ initialHero }: HeroFormClientProps) {
  const [values, setValues] = useState<HeroFormValues>(toFormValues(initialHero));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof HeroFormValues>(key: K, value: HeroFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorDetails(undefined);
    setSuccess(null);
    setIsSubmitting(true);

    const payload = {
      headline: values.headline,
      subtext: values.subtext || null,
      ctaText: values.ctaText || null,
      ctaLink: values.ctaLink || null,
      imageUrl: values.imageUrl || null,
      imagePublicId: values.imagePublicId || null,
    };

    try {
      await adminFetch<AdminHeroConfig>("/api/admin/hero", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSuccess("Hero section saved.");
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setErrorDetails(err.details);
      } else {
        setError("Failed to save hero configuration.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <form
        onSubmit={(e) => {
          handleSubmit(e).catch(() => {
            setError("Failed to save hero configuration.");
            setIsSubmitting(false);
          });
        }}
        className="flex flex-col gap-4 rounded border border-cream-dark bg-cream-off p-6"
      >
        <FormFeedback message={error} details={errorDetails} />
        <SuccessBanner message={success} />

        <div className="flex flex-col gap-1">
          <label htmlFor="headline" className="text-sm font-medium">
            Headline <span className="text-red-700">*</span>
          </label>
          <input
            id="headline"
            required
            maxLength={200}
            value={values.headline}
            onChange={(e) => update("headline", e.target.value)}
            className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="subtext" className="text-sm font-medium">
            Subtext
          </label>
          <textarea
            id="subtext"
            maxLength={500}
            rows={3}
            value={values.subtext}
            onChange={(e) => update("subtext", e.target.value)}
            className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="ctaText" className="text-sm font-medium">
              CTA text
            </label>
            <input
              id="ctaText"
              maxLength={100}
              value={values.ctaText}
              onChange={(e) => update("ctaText", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="ctaLink" className="text-sm font-medium">
              CTA link
            </label>
            <input
              id="ctaLink"
              maxLength={300}
              value={values.ctaLink}
              onChange={(e) => update("ctaLink", e.target.value)}
              placeholder="/catalog"
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>
        </div>

        <ImageUploadField
          label="Background image"
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
          {isSubmitting ? "Saving…" : "Save hero section"}
        </button>
      </form>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-warm">Live preview</p>
        <div
          className="relative flex min-h-[360px] flex-col items-start justify-center overflow-hidden rounded border border-cream-dark p-10"
          style={{
            backgroundColor: "#1A0F00",
            backgroundImage: values.imageUrl ? `url(${values.imageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-brown-deep/50" />
          <div className="relative z-10 max-w-md">
            <h2 className="font-heading text-3xl text-cream-off">
              {values.headline || "Your headline here"}
            </h2>
            {values.subtext && <p className="mt-3 text-cream-off/90">{values.subtext}</p>}
            {values.ctaText && (
              <span className="mt-5 inline-block rounded bg-green-primary px-5 py-2 font-medium text-cream-off">
                {values.ctaText}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
