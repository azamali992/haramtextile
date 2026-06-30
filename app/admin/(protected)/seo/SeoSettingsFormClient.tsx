"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { FormFeedback, SuccessBanner } from "../../_components/FormFeedback";

export interface AdminSeoSettings {
  id: number;
  siteTitleSuffix: string;
  defaultMetaDescription: string;
  googleAnalyticsId: string | null;
  organizationSameAs: string[];
  updatedAt: string | Date;
}

interface SeoSettingsFormValues {
  siteTitleSuffix: string;
  defaultMetaDescription: string;
  googleAnalyticsId: string;
  organizationSameAs: string[];
}

function toFormValues(settings: AdminSeoSettings | null): SeoSettingsFormValues {
  return {
    siteTitleSuffix: settings?.siteTitleSuffix ?? "",
    defaultMetaDescription: settings?.defaultMetaDescription ?? "",
    googleAnalyticsId: settings?.googleAnalyticsId ?? "",
    organizationSameAs: settings?.organizationSameAs ?? [],
  };
}

interface SeoSettingsFormClientProps {
  initialSettings: AdminSeoSettings | null;
}

/** Global SEO settings: title suffix, default meta description, GA id, and social profile URLs. */
export function SeoSettingsFormClient({ initialSettings }: SeoSettingsFormClientProps) {
  const [values, setValues] = useState<SeoSettingsFormValues>(toFormValues(initialSettings));
  const [newSameAsUrl, setNewSameAsUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof SeoSettingsFormValues>(key: K, value: SeoSettingsFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function addSameAsUrl() {
    const url = newSameAsUrl.trim();
    if (url && !values.organizationSameAs.includes(url)) {
      update("organizationSameAs", [...values.organizationSameAs, url]);
    }
    setNewSameAsUrl("");
  }

  function removeSameAsUrl(url: string) {
    update("organizationSameAs", values.organizationSameAs.filter((u) => u !== url));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorDetails(undefined);
    setSuccess(null);
    setIsSubmitting(true);

    const payload = {
      siteTitleSuffix: values.siteTitleSuffix,
      defaultMetaDescription: values.defaultMetaDescription,
      googleAnalyticsId: values.googleAnalyticsId || null,
      organizationSameAs: values.organizationSameAs,
    };

    try {
      await adminFetch<AdminSeoSettings>("/api/admin/seo-settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSuccess("SEO settings saved.");
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setErrorDetails(err.details);
      } else {
        setError("Failed to save SEO settings.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e).catch(() => {
          setError("Failed to save SEO settings.");
          setIsSubmitting(false);
        });
      }}
      className="flex max-w-2xl flex-col gap-4 rounded border border-cream-dark bg-cream-off p-6"
    >
      <FormFeedback message={error} details={errorDetails} />
      <SuccessBanner message={success} />

      <div className="flex flex-col gap-1">
        <label htmlFor="siteTitleSuffix" className="text-sm font-medium">
          Site title suffix <span className="text-red-700">*</span>
        </label>
        <input
          id="siteTitleSuffix"
          required
          maxLength={200}
          value={values.siteTitleSuffix}
          onChange={(e) => update("siteTitleSuffix", e.target.value)}
          placeholder="| Haram Textile"
          className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="defaultMetaDescription" className="text-sm font-medium">
          Default meta description <span className="text-red-700">*</span>
        </label>
        <textarea
          id="defaultMetaDescription"
          required
          maxLength={300}
          rows={3}
          value={values.defaultMetaDescription}
          onChange={(e) => update("defaultMetaDescription", e.target.value)}
          className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="googleAnalyticsId" className="text-sm font-medium">
          Google Analytics ID
        </label>
        <input
          id="googleAnalyticsId"
          maxLength={50}
          value={values.googleAnalyticsId}
          onChange={(e) => update("googleAnalyticsId", e.target.value)}
          placeholder="G-XXXXXXXXXX"
          className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="sameAsUrl" className="text-sm font-medium">
          Social profile URLs (organizationSameAs)
        </label>
        <div className="flex gap-2">
          <input
            id="sameAsUrl"
            type="url"
            value={newSameAsUrl}
            onChange={(e) => setNewSameAsUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSameAsUrl();
              }
            }}
            placeholder="https://www.linkedin.com/company/…"
            className="flex-1 rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
          />
          <button
            type="button"
            onClick={addSameAsUrl}
            className="rounded border border-cream-dark px-3 py-2 font-medium text-green-primary hover:bg-cream-dark"
          >
            Add
          </button>
        </div>

        {values.organizationSameAs.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {values.organizationSameAs.map((url) => (
              <li
                key={url}
                className="flex items-center justify-between rounded border border-cream-dark bg-white px-3 py-2 text-sm"
              >
                <span className="truncate">{url}</span>
                <button
                  type="button"
                  onClick={() => removeSameAsUrl(url)}
                  aria-label={`Remove ${url}`}
                  className="ml-2 shrink-0 text-gray-warm hover:text-red-700"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Save SEO settings"}
      </button>
    </form>
  );
}
