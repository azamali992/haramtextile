"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

export type PillButtonVariant = "light" | "solid" | "outline";

interface PillButtonBaseProps {
  children: ReactNode;
  /**
   * `light` — cream/white bg with deep-green text, hover to light-gold bg.
   * `solid` — deep-green bg with on-brand text, hover to deeper green.
   * `outline` — transparent with border, hover fills.
   * @default "solid"
   */
  variant?: PillButtonVariant;
  className?: string;
}

type PillButtonAsButton = PillButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: undefined;
  };

type PillButtonAsLink = PillButtonBaseProps & {
  href: string;
  onClick?: () => void;
};

export type PillButtonProps = PillButtonAsButton | PillButtonAsLink;

const VARIANT_BASE: Record<PillButtonVariant, string> = {
  light:
    "bg-[var(--surface-card)] text-[var(--brand-deep)] hover:bg-[var(--brand-light)] hover:text-[var(--on-brand)]",
  solid:
    "bg-[var(--brand-deep)] text-[var(--on-brand)] hover:bg-[var(--brand-deeper)]",
  outline:
    "border border-current text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--on-brand)]",
};

const ARROW_PATH = "M5 12h14M13 6l6 6-6 6";

/**
 * Pill-shaped CTA button with a trailing animated arrow.
 *
 * The arrow springs `x: 0 → 5` on hover (disabled on touch viewports ≤768px
 * and when prefers-reduced-motion is set, via Framer's spring).
 *
 * Renders a Next.js `<Link>` when `href` is provided, otherwise a `<button>`.
 *
 * @example
 * <PillButton variant="light" href="/contact">Get a Quote</PillButton>
 * <PillButton variant="solid" onClick={openContact}>Get a Quote</PillButton>
 */
export function PillButton({
  children,
  variant = "solid",
  className = "",
  ...props
}: PillButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseClasses = `inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-7 py-3.5 font-body text-sm font-medium uppercase tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 ${VARIANT_BASE[variant]} ${className}`;

  const arrowElement = (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      animate={undefined}
      whileHover={prefersReducedMotion ? undefined : { x: 5 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
    >
      <path d={ARROW_PATH} />
    </motion.svg>
  );

  const content = (
    <>
      {children}
      {arrowElement}
    </>
  );

  if ("href" in props && props.href) {
    const { href, onClick, ...rest } = props as PillButtonAsLink;
    void rest; // consumed
    return (
      <Link href={href} className={baseClasses} onClick={onClick}>
        {content}
      </Link>
    );
  }

  const { href: _href, ...buttonProps } = props as PillButtonAsButton & { href?: undefined };
  void _href;

  return (
    <button className={baseClasses} {...buttonProps}>
      {content}
    </button>
  );
}
