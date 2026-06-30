import type { ReactNode } from "react";

export type BadgeVariant = "moq" | "category";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  moq: "bg-gold-muted text-brown-deep",
  category: "bg-green-primary text-cream-off",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

/** Small pill label — gold for MOQ callouts, green for category tags. */
export function Badge({ variant = "category", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-medium ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
