"use client";

import { useState, type FormEvent } from "react";
import { Field, inputClass } from "@/components/ui/FormField";

interface ContactFormState {
  name: string;
  email: string;
  company: string;
  message: string;
}

const INITIAL_STATE: ContactFormState = { name: "", email: "", company: "", message: "" };

type SubmitStatus = "idle" | "loading" | "success" | "error";

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

/** Public contact form — posts to `/api/contact`, which validates with Zod and persists via Prisma. */
export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_STATE);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company || undefined,
          message: form.message,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
        setErrorMessage(body?.error?.message ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm(INITIAL_STATE);
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Field id="contact-name" label="Full name" required>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          maxLength={200}
          placeholder="Your name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className={inputClass}
        />
      </Field>

      <Field id="contact-email" label="Email" required>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={254}
          placeholder="you@company.com"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          className={inputClass}
        />
      </Field>

      <Field id="contact-company" label="Company" hint="(optional)">
        <input
          id="contact-company"
          name="company"
          type="text"
          maxLength={200}
          placeholder="Company name"
          value={form.company}
          onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
          className={inputClass}
        />
      </Field>

      <Field id="contact-message" label="Message" required>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={5000}
          placeholder="Tell us about your order requirements…"
          value={form.message}
          onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          className={`${inputClass} resize-none`}
        />
      </Field>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-1 inline-flex items-center justify-center self-start rounded-pill bg-[var(--brand-deep)] px-7 py-3.5 font-body text-sm font-medium uppercase tracking-wide text-[var(--on-brand)] transition-colors duration-150 hover:bg-[var(--brand-deeper)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
      >
        {status === "loading" ? "Sending…" : "Send Inquiry"}
      </button>

      <div role="status" aria-live="polite">
        {status === "success" && (
          <p className="font-body text-sm text-[var(--brand-deep)]">
            Thank you. Your inquiry has been received. Our export team will respond shortly.
          </p>
        )}
        {status === "error" && errorMessage && (
          <p className="font-body text-sm text-red-700">{errorMessage}</p>
        )}
      </div>
    </form>
  );
}
