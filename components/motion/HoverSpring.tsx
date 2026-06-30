"use client";

import { motion, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface HoverSpringProps {
  children: ReactNode;
  /**
   * The transform state to animate to on hover.
   * @example { x: 5 }
   * @example { scale: 1.03 }
   * @example { y: -8 }
   */
  to: TargetAndTransition;
  /**
   * Spring stiffness (maps from reference `tension`).
   * @default 300
   */
  stiffness?: number;
  /**
   * Spring damping (maps from reference `friction`).
   * @default 22
   */
  damping?: number;
  /** Extra classes on the motion wrapper. */
  className?: string;
}

/**
 * Wraps children with a spring hover animation (`whileHover`).
 * Disabled automatically on touch viewports (≤768px) and when the user
 * prefers reduced motion, ensuring no hover effects on mobile devices.
 *
 * @example
 * // Arrow nudge on hover: {tension:320, friction:20}
 * <HoverSpring to={{ x: 5 }} stiffness={320} damping={20}>
 *   <ArrowIcon />
 * </HoverSpring>
 */
export function HoverSpring({
  children,
  to,
  stiffness = 300,
  damping = 22,
  className = "",
}: HoverSpringProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isTouch, setIsTouch] = useState(false);
  const mediaRef = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    mediaRef.current = mql;
    setIsTouch(mql.matches);

    function handleChange(e: MediaQueryListEvent) {
      setIsTouch(e.matches);
    }

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // On touch viewports or reduced-motion, render children without animation.
  if (prefersReducedMotion || isTouch) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={to}
      transition={{
        type: "spring",
        stiffness,
        damping,
      }}
    >
      {children}
    </motion.div>
  );
}
