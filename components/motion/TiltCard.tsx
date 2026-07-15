"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

interface TiltCardProps {
  children: ReactNode;
  /** Classes for the tilting tile (aspect ratio, rounding, bg, overflow). */
  className?: string;
  /** Maximum tilt in degrees at the card edges. @default 9 */
  maxTilt?: number;
  /** Show the cursor-tracking specular sheen. @default true */
  glare?: boolean;
}

/**
 * Cursor-driven 3D tilt for a product tile. The tile leans toward the pointer
 * in perspective, lifts off a grounded shadow, scales forward, and (optionally)
 * carries a soft specular sheen that follows the cursor - giving flat garment
 * photography a dimensional, hand-held-object feel.
 *
 * Only animates transform/opacity. Disabled on touch/coarse pointers and when
 * the user prefers reduced motion, in which case it renders a plain wrapper so
 * the child's own CSS hover affordances still apply.
 */
export function TiltCard({
  children,
  className = "",
  maxTilt = 9,
  glare = true,
}: TiltCardProps) {
  const prefersReduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const rxRaw = useMotionValue(0);
  const ryRaw = useMotionValue(0);
  const scaleRaw = useMotionValue(1);
  const glareRaw = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const spring = { stiffness: 150, damping: 18, mass: 0.4 };
  const rotateX = useSpring(rxRaw, spring);
  const rotateY = useSpring(ryRaw, spring);
  const scale = useSpring(scaleRaw, spring);
  const glareOpacity = useSpring(glareRaw, { stiffness: 120, damping: 20 });
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(253,250,246,0.5), transparent 55%)`;

  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mql.matches && !prefersReduced);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [prefersReduced]);

  function handleMove(event: ReactPointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!enabled || !el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    ryRaw.set((px - 0.5) * 2 * maxTilt);
    rxRaw.set(-(py - 0.5) * 2 * maxTilt);
    glareX.set(px * 100);
    glareY.set(py * 100);
  }

  function handleEnter() {
    if (enabled) {
      setHovered(true);
      scaleRaw.set(1.04);
      glareRaw.set(1);
    }
  }

  function handleLeave() {
    setHovered(false);
    rxRaw.set(0);
    ryRaw.set(0);
    scaleRaw.set(1);
    glareRaw.set(0);
  }

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`relative rounded-card transition-shadow duration-300 ${
        hovered
          ? "shadow-[0_28px_60px_-18px_rgb(var(--scrim-rgb)/0.4)]"
          : "shadow-none"
      }`}
      style={{ perspective: 1100 }}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      <motion.div
        className={`${className} [transform-style:preserve-3d] will-change-transform`}
        style={{ rotateX, rotateY, scale }}
      >
        {children}
        {glare && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 mix-blend-soft-light"
            style={{ opacity: glareOpacity, background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  );
}
