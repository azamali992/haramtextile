"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

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
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-brown-deep">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          maxLength={200}
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className="mt-2 w-full rounded-md border border-cream-dark bg-cream-off px-4 py-2 text-base text-brown-deep transition-colors duration-150 focus:border-green-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-brown-deep">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={254}
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          className="mt-2 w-full rounded-md border border-cream-dark bg-cream-off px-4 py-2 text-base text-brown-deep transition-colors duration-150 focus:border-green-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact-company" className="block text-sm font-medium text-brown-deep">
          Company <span className="text-gray-warm">(optional)</span>
        </label>
        <input
          id="contact-company"
          name="company"
          type="text"
          maxLength={200}
          value={form.company}
          onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
          className="mt-2 w-full rounded-md border border-cream-dark bg-cream-off px-4 py-2 text-base text-brown-deep transition-colors duration-150 focus:border-green-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-brown-deep">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={5000}
          value={form.message}
          onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          className="mt-2 w-full rounded-md border border-cream-dark bg-cream-off px-4 py-2 text-base text-brown-deep transition-colors duration-150 focus:border-green-primary focus:outline-none"
        />
      </div>

      <Button type="submit" variant="primary" size="md" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Send Inquiry"}
      </Button>

      <div role="status" aria-live="polite">
        {status === "success" && (
          <Reveal>
            <p className="text-base text-green-primary">
              Thank you. Your inquiry has been received. Our export team will respond shortly.
            </p>
          </Reveal>
        )}
        {status === "error" && errorMessage && (
          <Reveal>
            <p className="text-base text-red-700">{errorMessage}</p>
          </Reveal>
        )}
      </div>
    </form>
  );
}
