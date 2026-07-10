"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /**
   * The final display value. The numeric portion is animated; any prefix or
   * suffix (e.g. "K+", "M+", "%") is rendered verbatim around it.
   * @example "600K+" · "30,000" · "220"
   */
  value: string;
  /** Animation duration in seconds. @default 1.6 */
  duration?: number;
  /** Extra classes on the wrapping span. */
  className?: string;
}

/** Splits "600K+" → { num: 600, prefix: "", suffix: "K+", grouped: false }. */
function parseValue(value: string) {
  const match = value.match(/^([^0-9]*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix, numStr, suffix] = match;
  return {
    prefix: prefix ?? "",
    num: Number(numStr!.replace(/,/g, "")),
    suffix: suffix ?? "",
    grouped: numStr!.includes(","),
  };
}

/**
 * Animates a stat value counting up from 0 the first time it enters the
 * viewport. Non-numeric prefixes/suffixes ("K+", "M+") render statically.
 * Under `prefers-reduced-motion` (or unparseable values) the final value
 * renders immediately.
 *
 * @example
 * <CountUp value="600K+" className="font-heading text-[4.5rem]" />
 */
export function CountUp({ value, duration = 1.6, className = "" }: CountUpProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const parsed = parseValue(value);
  // Initial state must match the server render (which never sees the reduced-
  // motion media query) — the effect below snaps to the final value on mount.
  const [display, setDisplay] = useState(() =>
    !parsed ? value : `${parsed.prefix}0${parsed.suffix}`,
  );

  useEffect(() => {
    if (prefersReducedMotion || !parsed) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    const controls = animate(0, parsed.num, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        const rounded = Math.round(latest);
        const numText = parsed.grouped
          ? rounded.toLocaleString("en-US")
          : String(rounded);
        setDisplay(`${parsed.prefix}${numText}${parsed.suffix}`);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, prefersReducedMotion, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
