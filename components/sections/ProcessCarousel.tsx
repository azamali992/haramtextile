"use client";

import Image from "next/image";
import Link from "next/link";
import { HorizontalScroller } from "@/components/ui/HorizontalScroller";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Inview } from "@/components/motion/Inview";

export interface ProcessSlide {
  /** Step slug — card links to `/production#{slug}`. */
  slug: string;
  title: string;
  description: string;
  statLabel: string | null;
  statValue: string | null;
  /** Resolved image URL (fallback already applied server-side). */
  imageUrl: string;
}

interface ProcessCarouselProps {
  /** Optional eyebrow above the section title. */
  eyebrow?: string;
  /** Section title lines. */
  title: string[];
  /** Body copy next to the title. */
  body?: string;
  steps: ProcessSlide[];
  className?: string;
}

/**
 * Home signature section #2 — the production process as an edge-bleeding
 * horizontal carousel on a deep-green band. Landscape photo cards with an
 * oversized ghost Playfair numeral, step title, one-line description and an
 * optional gold stat. Each card deep-links to `/production#{slug}`.
 */
export function ProcessCarousel({
  eyebrow,
  title,
  body,
  steps,
  className = "",
}: ProcessCarouselProps) {
  if (steps.length === 0) return null;

  return (
    <div
      className={`overflow-hidden rounded-card-lg bg-brand-deep py-24 sm:py-32 ${className}`}
    >
      <HorizontalScroller
        ariaLabel="Production process"
        dark
        header={
          <SectionHeader
            eyebrow={eyebrow}
            eyebrowTone="light"
            title={title}
            body={body}
            titleClassName="text-display text-[var(--on-brand)]"
            bodyClassName="max-w-xl text-on-brand/85"
          />
        }
      >
        {steps.map((step, i) => (
          <div key={step.slug} className="w-[85vw] shrink-0 snap-start sm:w-[34rem]">
            <Inview
              delayIn={Math.min(i, 3) * 90}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 32 }}
              to={{ opacity: 1, y: 0 }}
            >
              <Link
                href={`/production#${step.slug}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)]"
                draggable={false}
              >
                {/* Photo with overlapping ghost numeral */}
                <div className="relative">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-card">
                    <Image
                      src={step.imageUrl}
                      alt={`${step.title} — Haram Textile production`}
                      fill
                      sizes="(max-width: 640px) 85vw, 34rem"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading={i < 2 ? "eager" : "lazy"}
                      draggable={false}
                    />
                  </div>
                  <Inview
                    className="pointer-events-none absolute -top-10 left-4 select-none"
                    delayIn={Math.min(i, 3) * 90 + 120}
                    stiffness={180}
                    damping={24}
                    from={{ opacity: 0, scale: 0.7, y: 16 }}
                    to={{ opacity: 1, scale: 1, y: 0 }}
                  >
                    <span
                      className="block font-heading text-[8rem] font-normal leading-none text-on-brand/[0.14]"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Inview>
                </div>

                {/* Text below media — no card-in-card */}
                <div className="mt-6 flex items-start justify-between gap-6 px-1">
                  <div className="min-w-0">
                    <h3 className="font-heading text-title font-normal text-[var(--on-brand)]">
                      {step.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 font-body text-caption text-on-brand/80">
                      {step.description}
                    </p>
                    {/* Hover affordance — signals the card is a link */}
                    <span
                      className="mt-3 inline-flex items-center gap-1.5 font-body text-caption text-[var(--brand-light)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                      aria-hidden="true"
                    >
                      View step
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                  {step.statValue && (
                    <div className="shrink-0 border-l border-on-brand/15 pl-5 text-right">
                      <p className="font-heading text-title-sm italic text-[var(--brand-light)]">
                        {step.statValue}
                      </p>
                      {step.statLabel && (
                        <p className="mt-1 font-body text-[0.7rem] uppercase tracking-[0.14em] text-on-brand/55">
                          {step.statLabel}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </Inview>
          </div>
        ))}
      </HorizontalScroller>
    </div>
  );
}
