"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PillButton } from "@/components/ui/PillButton";
import { ArrowButton } from "@/components/ui/ArrowButton";

export interface ProcessStep {
  slug: string;
  title: string;
  description: string;
  statLabel?: string | null;
  statValue?: string | null;
  imageUrl: string;
}

interface ProcessShowcaseProps {
  eyebrow?: string;
  steps: ProcessStep[];
  ctaHref?: string;
  ctaText?: string;
  className?: string;
}

/** Cards further than this from the active one are not rendered. */
const VISIBLE_RANGE = 2;

/**
 * Signed distance from `active` to `i` on a circular list, so the stack wraps
 * seamlessly (last → first) instead of rewinding through the middle.
 */
function wrappedOffset(i: number, active: number, total: number): number {
  let delta = i - active;
  const half = total / 2;
  if (delta > half) delta -= total;
  if (delta < -half) delta += total;
  return delta;
}

/**
 * Home process section — a 3D vertical photo stack (one card per
 * manufacturing stage) with up/down controls, paired with a text panel that
 * swaps to match whichever stage is currently front-and-centre.
 *
 * The stack is a vertical coverflow: the active card sits flat at the front,
 * neighbours recede on the Z axis with an X-axis tilt so the whole thing
 * reads as a physical drum without the distortion of a true cylinder.
 *
 * Reduced motion: transforms still position the cards (the layout depends on
 * them) but transitions resolve instantly.
 */
export function ProcessShowcase({
  eyebrow,
  steps,
  ctaHref = "/production",
  ctaText = "See the full process",
  className = "",
}: ProcessShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  if (steps.length === 0) return null;

  const total = steps.length;
  const activeStep = steps[active];

  function go(direction: 1 | -1) {
    setActive((current) => (current + direction + total) % total);
  }

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 30 };

  return (
    <section
      className={`overflow-hidden bg-[var(--surface)] px-6 py-24 sm:px-10 sm:py-32 ${className}`}
      aria-labelledby="process-showcase-heading"
    >
      <div className="mx-auto grid max-w-[90rem] grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* ── Text panel — swaps with the active card ── */}
        <div>
          {eyebrow && <Eyebrow tone="dark">{eyebrow}</Eyebrow>}
          <h2 id="process-showcase-heading" className="sr-only">
            Our Production Process
          </h2>

          {/* Step counter */}
          <p className="mt-5 font-body text-eyebrow font-medium uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            {String(active + 1).padStart(2, "0")} &mdash;{" "}
            {String(total).padStart(2, "0")}
          </p>

          {/*
           * min-height reserves room for the tallest stage copy so swapping
           * steps doesn't shift the controls below.
           */}
          <div className="mt-4 min-h-[19rem] sm:min-h-[17rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.slug}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 300, damping: 30 }
                }
              >
                <p className="font-heading text-display font-normal leading-[0.98] tracking-tight text-[var(--ink)]">
                  {activeStep.title}
                </p>
                <p className="mt-6 max-w-xl font-body text-body leading-relaxed text-[var(--ink-soft)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] overflow-hidden">
                  {activeStep.description}
                </p>
                {activeStep.statLabel && activeStep.statValue && (
                  <div className="mt-7 inline-flex items-baseline gap-3 border-t border-[var(--brand)] pt-4">
                    <span className="font-heading text-[2rem] italic leading-none text-[var(--brand-strong)]">
                      {activeStep.statValue}
                    </span>
                    <span className="font-body text-caption uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                      {activeStep.statLabel}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls + CTA */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {/*
             * ArrowButton points right (or left with `prev`); rotating the
             * circular button 90° turns those into down / up without needing
             * a second icon set.
             */}
            <ArrowButton
              variant="outline"
              prev
              aria-label="Previous stage"
              onClick={() => go(-1)}
              className="rotate-90"
            />
            <ArrowButton
              variant="outline"
              aria-label="Next stage"
              onClick={() => go(1)}
              className="rotate-90"
            />
            <PillButton variant="solid" href={ctaHref} className="ml-2">
              {ctaText}
            </PillButton>
          </div>
        </div>

        {/* ── 3D vertical photo stack ── */}
        <div
          className="relative h-[28rem] sm:h-[36rem]"
          style={{ perspective: "1200px" }}
        >
          {/* Depth fade — receding cards dissolve into the section tone at
              the top and bottom edges rather than hard-clipping. */}
          <div
            className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(to_bottom,var(--surface),transparent_18%,transparent_82%,var(--surface))]"
            aria-hidden="true"
          />
          {steps.map((step, i) => {
            const offset = wrappedOffset(i, active, total);
            if (Math.abs(offset) > VISIBLE_RANGE) return null;

            const distance = Math.abs(offset);
            const isActive = offset === 0;

            return (
              <div
                key={step.slug}
                className="absolute inset-0 grid place-items-center"
                style={{
                  transformStyle: "preserve-3d",
                  zIndex: VISIBLE_RANGE + 1 - distance,
                }}
              >
                <motion.button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show ${step.title} stage`}
                  aria-current={isActive ? "true" : undefined}
                  tabIndex={isActive ? 0 : -1}
                  className={`relative block h-[16rem] w-[14rem] overflow-hidden rounded-card border bg-white shadow-float sm:h-[21rem] sm:w-[18rem] ${
                    isActive
                      ? "border-[var(--brand)] cursor-default"
                      : "cursor-pointer border-[var(--hairline)]"
                  }`}
                  animate={{
                    y: offset * 138,
                    z: -distance * 240,
                    rotateX: offset * -20,
                    scale: 1 - distance * 0.05,
                    opacity: distance === 0 ? 1 : distance === 1 ? 0.75 : 0.35,
                  }}
                  transition={transition}
                >
                  <Image
                    src={step.imageUrl}
                    alt={`${step.title} stage at Haram Textile's Faisalabad factory`}
                    fill
                    sizes="(max-width: 640px) 15rem, 20rem"
                    className="object-cover"
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                  {/* Depth scrim — back cards sink into the section tone */}
                  <div
                    className="absolute inset-0 bg-scrim transition-opacity duration-300"
                    style={{ opacity: isActive ? 0 : 0.4 }}
                    aria-hidden="true"
                  />
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
