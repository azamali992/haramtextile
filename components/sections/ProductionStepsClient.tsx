"use client";

import { useState } from "react";
import Image from "next/image";
import { Inview } from "@/components/motion/Inview";
import { RevealLines } from "@/components/motion/RevealLines";

interface ProductionStep {
  id: string;
  slug: string;
  title: string;
  description: string;
  statLabel: string | null;
  statValue: string | null;
  imageUrl: string;
  galleryImages?: { id: string; imageUrl: string }[];
}

interface ProductionStepsClientProps {
  steps: ProductionStep[];
  totalSteps: number;
}

/**
 * Photo + thumbnail strip for a single step. The main image swaps to
 * whichever thumbnail is clicked; the strip scrolls horizontally
 * (`overflow-x-auto`) so a step with several gallery photos stays usable on
 * narrow viewports instead of squeezing every thumbnail down to fit.
 */
function StepFigure({
  title,
  imageUrl,
  galleryImages,
  eager,
}: {
  title: string;
  imageUrl: string;
  galleryImages: { id: string; imageUrl: string }[];
  eager: boolean;
}) {
  const images = [{ id: "main", imageUrl }, ...galleryImages];
  const [activeId, setActiveId] = useState("main");
  const active = images.find((img) => img.id === activeId) ?? images[0];

  return (
    <figure>
      <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-card bg-[var(--surface)]">
        <Image
          key={active.id}
          src={active.imageUrl}
          alt={`${title} stage at Haram Textile's Faisalabad factory`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading={eager ? "eager" : "lazy"}
          priority={eager}
        />
      </div>
      <figcaption className="mt-3 font-body text-caption text-[var(--ink-soft)]">
        {title} - Haram Textile, Faisalabad
      </figcaption>

      {images.length > 1 && (
        <div
          className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
          role="list"
          aria-label={`${title} gallery photos`}
        >
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              role="listitem"
              onClick={() => setActiveId(img.id)}
              aria-current={img.id === activeId}
              aria-label={`View ${title} photo`}
              className={`relative aspect-square w-16 flex-shrink-0 snap-start overflow-hidden rounded-lg bg-[var(--surface)] transition sm:w-20 ${
                img.id === activeId
                  ? "ring-2 ring-[var(--brand)]"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.imageUrl} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}

/**
 * Production steps as alternating editorial rows: photo (caption below, not
 * glass-on-image) opposite a text column headed by an oversized ghost
 * numeral, hairline step counter, Playfair title reveal, description and an
 * optional gold stat callout. Row anchors (`id={slug}`) are preserved for
 * the HowTo JSON-LD deep links.
 */
export function ProductionStepsClient({ steps, totalSteps }: ProductionStepsClientProps) {
  return (
    <div className="flex flex-col gap-24 sm:gap-32">
      {steps.map((step, index) => {
        const isReversed = index % 2 === 1;
        const numeral = String(index + 1).padStart(2, "0");

        return (
          <div
            key={step.id}
            id={step.slug}
            className="grid scroll-mt-28 grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
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
              <StepFigure
                title={step.title}
                imageUrl={step.imageUrl}
                galleryImages={step.galleryImages ?? []}
                eager={index < 2}
              />
            </Inview>

            {/* Text column with ghost numeral */}
            <Inview
              delayIn={140}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              className={isReversed ? "lg:order-1" : ""}
            >
              <div className="relative">
                {/* Oversized ghost numeral behind the text */}
                <span
                  className="pointer-events-none absolute -top-14 left-0 select-none font-heading text-[7rem] font-normal leading-none text-[var(--ghost)] opacity-60"
                  aria-hidden="true"
                >
                  {numeral}
                </span>

                <div className="relative">
                  {/* Step counter */}
                  <p className="font-body text-eyebrow font-medium uppercase text-[var(--ink-soft)]">
                    {numeral} - {String(totalSteps).padStart(2, "0")}
                  </p>

                  <RevealLines
                    lines={[step.title]}
                    stagger={120}
                    duration={0.95}
                    className="mt-4 font-heading font-normal text-display text-[var(--ink)]"
                  />

                  <p className="mt-6 max-w-xl font-body text-body leading-relaxed text-[var(--ink-soft)]">
                    {step.description}
                  </p>

                  {/* Stat callout - admin-editable statLabel + statValue */}
                  {step.statLabel && step.statValue && (
                    <div className="mt-8 inline-flex items-baseline gap-3 border-t border-[var(--brand)] pt-4">
                      <span className="font-heading text-[2.25rem] leading-none italic text-[var(--brand-strong)]">
                        {step.statValue}
                      </span>
                      <span className="font-body text-caption uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                        {step.statLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Inview>
          </div>
        );
      })}
    </div>
  );
}
