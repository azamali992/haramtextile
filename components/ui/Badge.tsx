import type { ReactNode } from "react";

export type BadgeVariant = "moq" | "category";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  // Gold-wash chip for MOQ callouts
  moq: "bg-[var(--gold-100)] text-[var(--brand-strong)]",
  // Quiet hairline pill for category tags
  category: "border border-[var(--hairline)] text-[var(--ink-soft)]",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

/** Small pill label - gold wash for MOQ callouts, hairline for category tags. */
export function Badge({ variant = "category", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-4 py-1.5 font-body text-xs font-medium uppercase tracking-[0.12em] ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
