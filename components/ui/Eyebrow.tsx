import { type ReactNode } from "react";

export type EyebrowTone = "dark" | "light";

interface EyebrowProps {
  children: ReactNode;
  /**
   * `dark` - warm ink text with a gold dot. For use on light backgrounds.
   * `light` - on-brand text at 70% opacity with a light-gold dot. For use on
   * dark/green section backgrounds.
   * @default "dark"
   */
  tone?: EyebrowTone;
  className?: string;
}

/**
 * Eyebrow label component - a small uppercase tracking label with a leading
 * dot accent, used as a section kicker above large headlines.
 *
 * Size: `text-xs` (12px), medium weight, `letter-spacing: 0.22em`.
 *
 * @example
 * <Eyebrow tone="light">Get started</Eyebrow>
 */
export function Eyebrow({ children, tone = "dark", className = "" }: EyebrowProps) {
  const dotColor =
    tone === "dark"
      ? "bg-[var(--brand)]" // gold
      : "bg-[var(--brand-light)]"; // light gold

  const textColor =
    tone === "dark" ? "text-[var(--ink-soft)]" : "text-on-brand/70";

  return (
    <span
      className={`inline-flex items-center gap-2 font-body text-xs font-medium uppercase ${textColor} ${className}`}
      style={{ letterSpacing: "0.22em" }}
    >
      <span
        className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${dotColor}`}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
