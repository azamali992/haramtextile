"use client";

import { motion, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { type ReactNode } from "react";

interface InviewProps {
  children: ReactNode;
  /**
   * Initial (hidden) state.
   * @default { opacity: 0, y: 28 }
   */
  from?: TargetAndTransition;
  /**
   * Target (visible) state.
   * @default { opacity: 1, y: 0 }
   */
  to?: TargetAndTransition;
  /**
   * Delay before the animation starts, in milliseconds.
   * @default 0
   */
  delayIn?: number;
  /**
   * Spring stiffness (maps from reference `tension`).
   * @default 200
   */
  stiffness?: number;
  /**
   * Spring damping (maps from reference `friction`).
   * @default 26
   */
  damping?: number;
  /** Extra classes on the motion wrapper. */
  className?: string;
}

/**
 * Wraps children and plays a spring entrance animation the first time the
 * element enters the viewport. Animation plays **once** (viewport `once: true`).
 *
 * Spring config maps reference `{tension, friction}` → `{stiffness, damping}`.
 * Respects `prefers-reduced-motion` - skips animation when set.
 *
 * @example
 * // Match reference: from {opacity:0, y:28} delayIn 120ms {tension:200, friction:26}
 * <Inview delayIn={120} stiffness={200} damping={26}>
 *   <MyCard />
 * </Inview>
 */
export function Inview({
  children,
  from = { opacity: 0, y: 28 },
  to = { opacity: 1, y: 0 },
  delayIn = 0,
  stiffness = 200,
  damping = 26,
  className = "",
}: InviewProps) {
  // Reduced motion keeps the same DOM (a structural branch breaks hydration -
  // the server always renders the animated markup) and snaps straight to the
  // visible state with a zero-duration tween instead.
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={from}
      whileInView={{
        ...(to as TargetAndTransition),
        transition: prefersReducedMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness,
              damping,
              delay: delayIn / 1000,
            },
      }}
      viewport={{ once: true, ...(prefersReducedMotion ? { amount: 0 } : {}) }}
    >
      {children}
    </motion.div>
  );
}
