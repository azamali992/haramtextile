"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Inview } from "@/components/motion/Inview";
import { RevealLines } from "@/components/motion/RevealLines";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface ProductionStep {
  id: string;
  slug: string;
  title: string;
  description: string;
  statLabel: string | null;
  statValue: string | null;
  imageUrl: string;
}

interface ProductionStepsClientProps {
  steps: ProductionStep[];
  totalSteps: number;
}

/**
 * Client component rendering the production steps list with alternating
 * image/text layouts and Inview + parallax motion.
 *
 * Each step shows:
 * - A hover-scale glassy image (reference Facilities card pattern)
 * - Step counter eyebrow
 * - Clip-mask title reveal (RevealLines)
 * - Description with Inview rise-in
 * - statLabel/statValue when present (admin-editable)
 */
export function ProductionStepsClient({ steps, totalSteps }: ProductionStepsClientProps) {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {steps.map((step, index) => {
        const isReversed = index % 2 === 1;

        return (
          <div
            key={step.id}
            id={step.slug}
            className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2`}
          >
            {/* Image column */}
            <Inview
              delayIn={0}
              stiffness={180}
              damping={26}
              from={{ opacity: 0, y: 48 }}
              to={{ opacity: 1, y: 0 }}
              className={isReversed ? "lg:order-2" : ""}
            >
              <motion.figure
                className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card-lg)] bg-[var(--surface)]"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <Image
                  src={step.imageUrl}
                  alt={`${step.title} stage at Haram Textile's Faisalabad factory`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  loading={index < 2 ? "eager" : "lazy"}
                  priority={index < 2}
                />
                {/* Glass caption */}
                <figcaption className="absolute inset-x-3 bottom-3 rounded-[var(--radius-card)] bg-[var(--brand-deep)]/60 p-3 backdrop-blur-sm">
                  <p className="font-body text-sm font-medium text-[var(--on-brand)]">
                    {step.title}
                  </p>
                  <p className="mt-0.5 font-body text-[0.65rem] leading-snug text-[rgba(253,250,246,0.8)]">
                    Haram Textile — Faisalabad, Pakistan
                  </p>
                </figcaption>
              </motion.figure>
            </Inview>

            {/* Text column */}
            <Inview
              delayIn={140}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              className={isReversed ? "lg:order-1" : ""}
            >
              <div>
                {/* Step counter */}
                <Eyebrow tone="dark">
                  Step {index + 1} of {totalSteps}
                </Eyebrow>

                {/* Title — stacked lines reveal; split at space for two-word titles */}
                <RevealLines
                  lines={
                    step.title.includes(" ")
                      ? step.title.split(/\s+/).slice(0, 2).concat(
                          step.title.split(/\s+/).slice(2).join(" ")
                        ).filter(Boolean)
                      : [step.title]
                  }
                  stagger={120}
                  duration={0.95}
                  className="mt-4 font-heading text-[2.25rem] leading-[0.95] tracking-tight text-[var(--ink)]"
                />

                {/* Description */}
                <p className="mt-6 font-body text-base leading-relaxed text-[var(--ink-soft)]">
                  {step.description}
                </p>

                {/* Stat callout — admin-editable statLabel + statValue */}
                {step.statLabel && step.statValue && (
                  <div className="mt-6 inline-flex items-baseline gap-2">
                    <span className="font-heading text-[2rem] leading-none text-[var(--brand-deep)]">
                      {step.statValue}
                    </span>
                    <span className="font-body text-sm text-[var(--ink-soft)]">
                      {step.statLabel}
                    </span>
                  </div>
                )}
              </div>
            </Inview>
          </div>
        );
      })}
    </div>
  );
}
