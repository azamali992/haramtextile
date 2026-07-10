import type { ReactElement } from "react";

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  /** Optional muted suffix after the label, e.g. "(optional)". */
  hint?: string;
  children: ReactElement;
}

/**
 * Shared form field: uppercase tracked label above the control.
 * Used by both the contact modal and the contact page form so the two
 * render identically.
 */
export function Field({ id, label, required, hint, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-body text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-soft)]"
      >
        {label}
        {hint && <span className="normal-case tracking-normal"> {hint}</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/** Shared input/textarea styling — rounded, hairline border, gold focus ring. */
export const inputClass =
  "w-full rounded-xl border border-[var(--hairline)] bg-[var(--background)] px-4 py-3 font-body text-sm text-[var(--ink)] transition-colors duration-150 placeholder:text-[var(--ghost)] focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]";
