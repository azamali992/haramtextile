"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { useScrollParallax } from "@/components/motion/useScrollParallax";

interface ParallaxProps {
  /**
   * The media to parallax — typically a `next/image` with `fill`.
   * Rendered inside an oversized plate so the translate never exposes edges.
   */
  children: ReactNode;
  /**
   * translateY output range mapped from scroll progress.
   * @default ["0%", "12%"]
   */
  range?: [string, string];
  /** Extra classes on the outer plate wrapper. */
  className?: string;
}

/**
 * Scroll-parallax media plate. Wraps `useScrollParallax` with the oversized
 * plate pattern (top: -16%, height: 132%) so the image can translate without
 * revealing its edges. Place inside a `relative overflow-hidden` container.
 *
 * Respects `prefers-reduced-motion` — renders a static, full-cover plate.
 *
 * @example
 * <div className="relative aspect-[21/9] overflow-hidden rounded-card-lg">
 *   <Parallax>
 *     <Image src={src} alt={alt} fill className="object-cover" />
 *   </Parallax>
 * </div>
 */
export function Parallax({
  children,
  range = ["0%", "12%"],
  className = "",
}: ParallaxProps) {
  const prefersReducedMotion = useReducedMotion();
  // Same DOM in both modes (SSR renders the non-reduced branch, so a
  // structural branch here would break hydration) — reduced motion simply
  // collapses the parallax range to zero.
  const { ref, value: y } = useScrollParallax<HTMLDivElement>({
    outputRange: prefersReducedMotion ? ["0%", "0%"] : range,
  });

  return (
    <div
      ref={ref}
      className={`absolute inset-x-0 w-full ${className}`}
      style={{ top: "-16%", height: "132%" }}
    >
      <motion.div className="relative h-full w-full" style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
