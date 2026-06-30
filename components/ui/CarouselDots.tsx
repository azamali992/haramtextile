"use client";

import { motion } from "framer-motion";

export type CarouselDotsTone = "dark" | "light";

interface CarouselDotsProps {
  /** Total number of dots / slides. */
  count: number;
  /** Zero-based index of the currently active slide. */
  activeIndex: number;
  /** Callback fired with the target index when a dot is clicked. */
  onChange: (index: number) => void;
  /**
   * `dark` — filled dot uses `--ink`, idle uses `--ghost`.
   * `light` — filled dot uses white, idle uses white @ 40%.
   * @default "dark"
   */
  tone?: CarouselDotsTone;
  className?: string;
}

/**
 * A row of pill-shaped dots for carousel navigation.
 *
 * Active dot animates to `width: 1.25rem` (filled pill); idle dots are
 * `0.375rem` squares that visually read as circles. The active dot carries
 * `aria-current="true"`.
 *
 * @example
 * <CarouselDots count={3} activeIndex={slide} onChange={setSlide} tone="light" />
 */
export function CarouselDots({
  count,
  activeIndex,
  onChange,
  tone = "dark",
  className = "",
}: CarouselDotsProps) {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="tablist"
      aria-label="Carousel slides"
    >
      {Array.from({ length: count }, (_, i) => {
        const isActive = i === activeIndex;

        const fillColor =
          tone === "dark" ? "var(--ink)" : "rgba(253,250,246,1)";
        const idleColor =
          tone === "dark" ? "var(--ghost)" : "rgba(253,250,246,0.4)";

        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => onChange(i)}
            className="p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 rounded-full"
          >
            <motion.span
              style={{ display: "block", height: "0.375rem", borderRadius: "var(--radius-pill)" }}
              animate={{
                width: isActive ? "1.25rem" : "0.375rem",
                backgroundColor: isActive ? fillColor : idleColor,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </button>
        );
      })}
    </div>
  );
}
