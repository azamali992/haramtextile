"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealLines } from "@/components/motion/RevealLines";
import { useLenis } from "@/components/motion/LenisProvider";
import { useUI } from "@/components/layout/UIProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  message: string;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

interface ApiErrorBody {
  error?: { message?: string };
}

const INITIAL_FORM: FormState = { name: "", email: "", message: "" };

// ─── Field component ──────────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactElement;
}

function Field({ id, label, required, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-body text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-soft)]"
      >
        {label}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--hairline)] bg-[var(--background)] px-4 py-3 font-body text-sm text-[var(--ink)] transition-colors duration-150 placeholder:text-[var(--ghost)] focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]";

// ─── Panel (inner) ────────────────────────────────────────────────────────────

interface PanelProps {
  onClose: () => void;
}

// Selector for all naturally focusable elements within a container.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Panel({ onClose }: PanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Focus name field after ~120ms (spec requirement).
  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  // Focus trap: Tab and Shift+Tab cycle within the panel.
  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => !el.closest("[inert]") && el.offsetParent !== null,
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
        setErrorMsg(body?.error?.message ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  function handleDone() {
    onClose();
    // Reset form after the exit animation completes (~350ms).
    setTimeout(() => {
      setForm(INITIAL_FORM);
      setStatus("idle");
      setErrorMsg(null);
    }, 350);
  }

  const firstName = form.name.trim().split(/\s+/)[0] || "there";

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Get a quote"
      className="relative w-full max-w-lg overflow-y-auto rounded-[var(--radius-card-lg)] bg-[var(--surface-card)] p-6 text-[var(--ink)] shadow-[0_24px_64px_rgba(30,58,15,0.28)] sm:p-8"
      style={{ maxHeight: "92svh" }}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: 28, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      // Stop click propagation so backdrop click doesn't fire.
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handlePanelKeyDown}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow tone="dark">Get a Quote</Eyebrow>
          <div className="mt-3 font-heading text-4xl font-medium leading-[0.95] tracking-tight text-[var(--ink)] sm:text-5xl">
            <RevealLines
              lines={["Let's work", "together"]}
              stagger={90}
              duration={0.8}
            />
          </div>
        </div>
        {/* Close button */}
        <motion.button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="mt-1 grid size-10 flex-shrink-0 place-items-center rounded-[var(--radius-pill)] bg-[var(--surface)] transition-colors duration-150 hover:bg-[var(--hairline)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          whileHover={prefersReducedMotion ? undefined : { rotate: 90 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </motion.button>
      </div>

      {/* Success panel */}
      {status === "success" ? (
        <div className="mt-7 rounded-[var(--radius-card)] bg-[var(--surface)] p-6 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--brand-deep)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--on-brand)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-4 font-body text-lg font-medium text-[var(--ink)]">Request received</p>
          <p className="mt-2 font-body text-sm text-[var(--ink-soft)]">
            Thanks, {firstName} — our export team will be in touch shortly.
          </p>
          <button
            type="button"
            onClick={handleDone}
            className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--brand-deep)] px-7 py-3.5 font-body text-sm font-medium uppercase tracking-wide text-[var(--on-brand)] transition-colors duration-150 hover:bg-[var(--brand-deeper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          >
            Done
          </button>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4" noValidate>
          <Field id="modal-name" label="Full name" required>
            <input
              ref={nameRef}
              id="modal-name"
              type="text"
              required
              maxLength={200}
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={inputClass}
            />
          </Field>

          <Field id="modal-email" label="Email" required>
            <input
              id="modal-email"
              type="email"
              required
              maxLength={254}
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className={inputClass}
            />
          </Field>

          <Field id="modal-message" label="Message" required>
            <textarea
              id="modal-message"
              required
              rows={3}
              maxLength={5000}
              placeholder="Tell us about your order requirements…"
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {status === "error" && errorMsg && (
            <p role="alert" className="font-body text-sm text-red-700">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-2 inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--brand-deep)] px-7 py-3.5 font-body text-sm font-medium uppercase tracking-wide text-[var(--on-brand)] transition-colors duration-150 hover:bg-[var(--brand-deeper)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          >
            {status === "loading" ? "Sending…" : "Request a Quote"}
          </button>
        </form>
      )}
    </motion.div>
  );
}

// ─── ContactModal (exported) ──────────────────────────────────────────────────

/**
 * Portaled contact modal. Open/close state is managed by `UIProvider`
 * (`useUI().openContact()` / `useUI().closeContact()`).
 *
 * This component should be mounted once inside `UIProvider` in the public
 * layout — it renders itself into `document.body` via a portal.
 *
 * Features:
 * - Backdrop blur + green-deep @ 40% overlay
 * - Springs in from `{opacity:0, y:28, scale:0.96}`
 * - Posts to real `/api/contact` (JSON `{name, email, message}`)
 * - Success panel with first-name personalisation
 * - Esc closes; focus trap to name field on open
 * - Scroll-locked via `useLenis()` while open
 */
export function ContactModal() {
  const { isContactOpen, closeContact } = useUI();
  const { stop, start } = useLenis();
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  // Remember the trigger element so focus can be restored on close.
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll lock / unlock + focus save/restore.
  useEffect(() => {
    if (isContactOpen) {
      triggerRef.current = document.activeElement;
      stop();
    } else {
      start();
      if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
        setTimeout(() => {
          (triggerRef.current as HTMLElement).focus();
        }, 50);
      }
    }
  }, [isContactOpen, stop, start]);

  // Esc closes.
  useEffect(() => {
    if (!isContactOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeContact();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isContactOpen, closeContact]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isContactOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center px-3 pb-3 sm:items-center sm:px-6"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "rgba(31,58,15,0.4)" }}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
            onClick={closeContact}
            aria-hidden="true"
          />
          {/* Panel */}
          <Panel onClose={closeContact} />
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
