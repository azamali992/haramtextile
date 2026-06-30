"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

// easeOutExpo cubic-bezier approximation
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface RevealLinesProps {
  /**
   * Each string in this array becomes one clipped line. Pass the visual line
   * breaks you want, e.g. `["Built for", "every level"]`.
   */
  lines: string[];
  /**
   * Stagger delay between each line in milliseconds.
   * @default 120
   */
  stagger?: number;
  /**
   * Duration of each line's reveal in seconds.
   * @default 0.95
   */
  duration?: number;
  /**
   * Base delay before the first line starts, in milliseconds.
   * @default 0
   */
  baseDelay?: number;
  /**
   * Re-fires the reveal whenever this key changes.
   */
  animationKey?: string | number;
  /** Extra classes on the outer wrapper. */
  className?: string;
  /** Extra classes on each line span (e.g. `font-heading text-5xl`). */
  lineClassName?: string;
}

const containerVariants: Variants = {
  hidden: {},
  visible: ({ stagger, baseDelay }: { stagger: number; baseDelay: number }) => ({
    transition: {
      staggerChildren: stagger / 1000,
      delayChildren: baseDelay / 1000,
    },
  }),
};

const lineVariants: Variants = {
  hidden: { y: "115%", opacity: 0 },
  visible: (duration: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration,
      ease: EASE_OUT_EXPO,
    },
  }),
};

/**
 * Reveals an array of text lines using a clip-mask slide-up animation.
 * Each line is wrapped in an `overflow-hidden` clip box so the animation is
 * masked (descenders are protected with `padding-bottom: 0.14em`).
 *
 * Designed for stacked display headlines, e.g. "Built for / every level".
 * Respects `prefers-reduced-motion`.
 *
 * @example
 * <RevealLines
 *   lines={["Ready to", "start your order?"]}
 *   stagger={120}
 *   className="font-heading text-5xl text-cream-off leading-[0.95]"
 * />
 */
export function RevealLines({
  lines,
  stagger = 120,
  duration = 0.95,
  baseDelay = 0,
  animationKey,
  className = "",
  lineClassName = "",
}: RevealLinesProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      key={animationKey}
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={{ stagger, baseDelay }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            overflow: "hidden",
            paddingBottom: "0.14em",
            marginBottom: "-0.14em",
          }}
        >
          <motion.span
            className={`block ${lineClassName}`}
            variants={lineVariants}
            custom={duration}
          >
            {line}
          </motion.span>
        </div>
      ))}
    </motion.div>
  );
}
