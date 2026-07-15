"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ButtonHTMLAttributes } from "react";

export type ArrowButtonVariant = "outline" | "outlineLight" | "solid";

interface ArrowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * `outline` - hairline border, transparent bg, ink text.
   * `outlineLight` - translucent on-brand border/text, for dark green bands.
   * `solid` - deep-green bg, on-brand text.
   * @default "outline"
   */
  variant?: ArrowButtonVariant;
  /**
   * When true, flips the arrow horizontally for a "previous" direction.
   * @default false
   */
  prev?: boolean;
  /** Accessible label - required since the button contains only an icon. */
  "aria-label": string;
}

const ARROW_PATH = "M5 12h14M13 6l6 6-6 6";

/**
 * Circle icon button for carousel previous/next controls.
 *
 * The inner arrow scales `1 → 1.15` on hover (disabled on touch viewports and
 * when prefers-reduced-motion is set).
 *
 * @example
 * <ArrowButton variant="outline" prev aria-label="Previous slide" onClick={prev} />
 * <ArrowButton variant="solid" aria-label="Next slide" onClick={next} />
 */
export function ArrowButton({
  variant = "outline",
  prev = false,
  className = "",
  ...props
}: ArrowButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const variantClasses =
    variant === "solid"
      ? "bg-[var(--brand-deep)] border-[var(--brand-deep)] text-[var(--on-brand)] hover:bg-[var(--brand-deeper)]"
      : variant === "outlineLight"
        ? "border-on-brand/25 bg-transparent text-[var(--on-brand)] hover:border-on-brand/70"
        : "border-[var(--hairline)] bg-transparent text-[var(--ink)] hover:border-[var(--ink)]";

  return (
    <button
      type="button"
      className={`grid size-12 place-items-center rounded-[var(--radius-pill)] border transition-colors duration-150 sm:size-14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 ${variantClasses} ${className}`}
      {...props}
    >
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ scaleX: prev ? -1 : 1 }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.15 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
      >
        <path d={ARROW_PATH} />
      </motion.svg>
    </button>
  );
}
