"use client";

import { useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type RefObject } from "react";

interface UseScrollParallaxOptions {
  /**
   * Output range values mapped from the element's scroll progress (0 → 1).
   * @example ["0%", "12%"]  // hero plate translateY
   * @example ["-3%", "3%"]  // ghost word X parallax
   */
  outputRange: [string | number, string | number];
  /**
   * The scroll offset pair that defines when progress starts and ends.
   * Defaults to the element entering at the bottom and leaving at the top.
   * @default ["start end", "end start"]
   */
  offset?: ["start end" | "end start" | "start start" | "end end", "start end" | "end start" | "start start" | "end end"];
}

interface UseScrollParallaxResult<T extends HTMLElement> {
  ref: RefObject<T>;
  value: MotionValue<string | number>;
}

/**
 * Maps an element's scroll progress through the viewport to an output range
 * using Framer Motion's `useScroll` + `useTransform`.
 *
 * Returns a `ref` to attach to the target element and a `value` MotionValue
 * to bind to a `motion.*` element's `style` prop.
 *
 * @example
 * // Hero plate translateY 0% → 12%
 * const { ref, value: y } = useScrollParallax<HTMLDivElement>({
 *   outputRange: ["0%", "12%"],
 * });
 * return <motion.div ref={ref} style={{ y }}>...</motion.div>;
 *
 * @example
 * // Ghost word X parallax: enters on right, exits on left
 * const { ref, value: x } = useScrollParallax<HTMLSpanElement>({
 *   outputRange: ["3%", "-3%"],
 * });
 */
export function useScrollParallax<T extends HTMLElement>({
  outputRange,
  offset = ["start end", "end start"],
}: UseScrollParallaxOptions): UseScrollParallaxResult<T> {
  const ref = useRef<T>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });

  const value = useTransform(scrollYProgress, [0, 1], outputRange);

  return { ref, value };
}
