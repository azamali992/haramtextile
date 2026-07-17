"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { FormFeedback, SuccessBanner } from "../../_components/FormFeedback";

interface ContactEmailValue {
  label: string;
  email: string;
}

interface ContactSettingsValues {
  phone: string;
  address: string;
  mapLink: string;
  hours: string;
  emails: ContactEmailValue[];
}

interface InitialSettings {
  phone: string;
  address: string;
  mapLink: string | null;
  hours: string | null;
  emails: unknown;
}

interface Fallback {
  phone: string;
  address: string;
  mapLink: string;
  hours: string;
  emails: ContactEmailValue[];
}

/** JSON column - narrow it before it reaches the form state. */
function toEmailValues(raw: unknown): ContactEmailValue[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) =>
    typeof entry === "object" &&
    entry !== null &&
    typeof (entry as ContactEmailValue).label === "string" &&
    typeof (entry as ContactEmailValue).email === "string"
      ? [{ label: (entry as ContactEmailValue).label, email: (entry as ContactEmailValue).email }]
      : [],
  );
}

function toFormValues(
  settings: InitialSettings | null,
  fallback: Fallback,
): ContactSettingsValues {
  // Pre-fill from the static fallback on first use so the admin edits the
  // values the site is actually showing, rather than an empty form.
  if (!settings) {
    return {
      phone: fallback.phone,
      address: fallback.address,
      mapLink: fallback.mapLink,
      hours: fallback.hours,
      emails: fallback.emails.map((e) => ({ ...e })),
    };
  }
  const emails = toEmailValues(settings.emails);
  return {
    phone: settings.phone,
    address: settings.address,
    mapLink: settings.mapLink ?? "",
    hours: settings.hours ?? "",
    emails: emails.length > 0 ? emails : fallback.emails.map((e) => ({ ...e })),
  };
}

interface ContactSettingsFormClientProps {
  initialSettings: InitialSettings | null;
  fallback: Fallback;
}

const inputClass =
  "rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary";

/** Contact details: phone, address, map link, hours, and the labelled email list. */
export function ContactSettingsFormClient({
  initialSettings,
  fallback,
}: ContactSettingsFormClientProps) {
  const [values, setValues] = useState<ContactSettingsValues>(
    toFormValues(initialSettings, fallback),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof ContactSettingsValues>(key: K, value: ContactSettingsValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateEmail(index: number, patch: Partial<ContactEmailValue>) {
    update(
      "emails",
      values.emails.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
  }

  function addEmail() {
    update("emails", [...values.emails, { label: "", email: "" }]);
  }

  function removeEmail(index: number) {
    update("emails", values.emails.filter((_, i) => i !== index));
  }

  function moveEmail(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= values.emails.length) return;
    const next = [...values.emails];
    [next[index], next[target]] = [next[target], next[index]];
    update("emails", next);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorDetails(undefined);
    setSuccess(null);
    setIsSubmitting(true);

    const payload = {
      phone: values.phone,
      address: values.address,
      mapLink: values.mapLink || null,
      hours: values.hours || null,
      emails: values.emails,
    };

    try {
      await adminFetch("/api/admin/contact-settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSuccess("Contact details saved.");
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setErrorDetails(err.details);
      } else {
        setError("Failed to save contact details.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e).catch(() => {
          setError("Failed to save contact details.");
          setIsSubmitting(false);
        });
      }}
      className="flex max-w-2xl flex-col gap-4 rounded border border-cream-dark bg-cream-off p-6"
    >
      <FormFeedback message={error} details={errorDetails} />
      <SuccessBanner message={success} />

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone <span className="text-red-700">*</span>
        </label>
        <input
          id="phone"
          required
          maxLength={60}
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="(+92) 41-8814858"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="text-sm font-medium">
          Address <span className="text-red-700">*</span>
        </label>
        <textarea
          id="address"
          required
          maxLength={400}
          rows={3}
          value={values.address}
          onChange={(e) => update("address", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="mapLink" className="text-sm font-medium">
          Map link
        </label>
        <input
          id="mapLink"
          type="url"
          maxLength={500}
          value={values.mapLink}
          onChange={(e) => update("mapLink", e.target.value)}
          placeholder="https://maps.app.goo.gl/…"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="hours" className="text-sm font-medium">
          Office hours
        </label>
        <input
          id="hours"
          maxLength={200}
          value={values.hours}
          onChange={(e) => update("hours", e.target.value)}
          placeholder="Mon-Sat 9:30 am - 6:00 pm; Sunday closed"
          className={inputClass}
        />
      </div>

      {/* Email list */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Email addresses</span>
        <p className="-mt-1 text-xs text-gray-warm">
          Shown on the Contact page as “Label: address”. The first entry is used
          as the primary address in the footer and page metadata.
        </p>

        {values.emails.length === 0 && (
          <p className="rounded border border-cream-dark bg-white px-3 py-2 text-sm text-gray-warm">
            No email addresses yet — the site will fall back to the built-in defaults.
          </p>
        )}

        {values.emails.map((entry, index) => (
          <div key={index} className="flex items-start gap-2">
            <input
              aria-label={`Label for email ${index + 1}`}
              required
              maxLength={60}
              value={entry.label}
              onChange={(e) => updateEmail(index, { label: e.target.value })}
              placeholder="CEO"
              className={`${inputClass} w-32 shrink-0`}
            />
            <input
              aria-label={`Email address ${index + 1}`}
              type="email"
              required
              maxLength={200}
              value={entry.email}
              onChange={(e) => updateEmail(index, { email: e.target.value })}
              placeholder="name@haramtextile.com"
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => moveEmail(index, -1)}
              disabled={index === 0}
              aria-label={`Move email ${index + 1} up`}
              className="rounded border border-cream-dark px-2 py-2 text-sm disabled:opacity-40"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveEmail(index, 1)}
              disabled={index === values.emails.length - 1}
              aria-label={`Move email ${index + 1} down`}
              className="rounded border border-cream-dark px-2 py-2 text-sm disabled:opacity-40"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => removeEmail(index)}
              aria-label={`Remove email ${index + 1}`}
              className="rounded border border-cream-dark px-2 py-2 text-sm text-gray-warm hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addEmail}
          className="self-start rounded border border-cream-dark px-3 py-2 text-sm font-medium text-green-primary hover:bg-cream-dark"
        >
          Add email
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Save contact details"}
      </button>
    </form>
  );
}
