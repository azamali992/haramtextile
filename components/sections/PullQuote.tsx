"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Inview } from "@/components/motion/Inview";
import { RevealText } from "@/components/motion/RevealText";
import { Eyebrow } from "@/components/ui/Eyebrow";

export interface PullQuoteCertBadge {
  /** Short certification name shown as a chip. */
  name: string;
  /** Optional issuing body shown after the name. */
  issuingBody?: string | null;
}

interface PullQuoteProps {
  /** Optional eyebrow kicker (omit on home — the quote speaks for itself). */
  eyebrow?: string;
  /** Optional header lines above the quote. */
  title?: string[];
  /**
   * The pull-quote text (without surrounding quotation marks — the component
   * renders the opening quote glyph).
   */
  quote: string;
  /** Attribution line, e.g. "Rashid Mehmood, CEO — Haram Textile". */
  attribution?: string;
  /** Optional list of certification chips shown as trust markers. */
  certBadges?: PullQuoteCertBadge[];
  /** Extra classes on the outer `<section>`. */
  className?: string;
}

/**
 * Centered editorial pull-quote with scroll-triggered word-by-word text
 * reveal (via RevealText gated on useInView) and an animated opening glyph
 * that spins into place before the words begin.
 *
 * Animation sequence (triggered once on viewport entry):
 *   1. Opening `"` glyph — spring scale+rotate from hidden
 *   2. Quote words — clip-mask slide-up staggered at 55 ms intervals
 *   3. Attribution — Inview rise-in with 600 ms delay
 *   4. Cert badges — staggered Inview rise-ins
 *
 * All motion collapses to instant-visible under prefers-reduced-motion.
 */
export function PullQuote({
  eyebrow,
  title,
  quote,
  attribution,
  certBadges,
  className = "",
}: PullQuoteProps) {
  const prefersReducedMotion = useReducedMotion();

  /*
   * Attach a ref to the <figure> so we can gate the glyph animation and the
   * RevealText's `ready` prop on the same IntersectionObserver entry.
   * margin: "-10% 0px" fires slightly before the figure reaches centre-screen.
   */
  const figureRef = useRef<HTMLElement>(null);
  const quoteInView = useInView(figureRef, { once: true, margin: "-10% 0px" });

  return (
    <section
      id="testimonials"
      className={`bg-[var(--background)] px-6 py-24 sm:px-10 sm:py-32 ${className}`}
    >
      <div className="mx-auto max-w-4xl text-center">
        {/* Optional header */}
        {(eyebrow || (title && title.length > 0)) && (
          <div className="mb-14">
            {eyebrow && <Eyebrow tone="dark">{eyebrow}</Eyebrow>}
            {title && title.length > 0 && (
              <div className="mt-4">
                {title.map((line, i) => (
                  <p
                    key={i}
                    className="font-heading font-normal text-display text-[var(--ink)]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/*
         * The <figure> is the IntersectionObserver target (figureRef).
         * When it enters the viewport, quoteInView flips to true and
         * all child animations fire in sequence.
         */}
        <figure
          ref={figureRef}
          className="border-y border-[var(--hairline)] py-14 sm:py-16"
        >
          {/*
           * Opening quote glyph — springs in from scale(0.5) + rotate(-15°).
           * Controlled by quoteInView (same trigger as the word reveals).
           * prefers-reduced-motion: transition duration collapses to 0.
           */}
          <motion.span
            className="block font-heading text-[4.5rem] leading-[0.5] text-[var(--brand)]"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
            animate={
              prefersReducedMotion || quoteInView
                ? { opacity: 1, scale: 1, rotate: 0 }
                : { opacity: 0, scale: 0.5, rotate: -15 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 220, damping: 18, delay: 0.05 }
            }
          >
            &ldquo;
          </motion.span>

          {/*
           * Quote text — word-by-word clip-mask slide-up via RevealText.
           * Uses the `gated` + `ready` API so the animation only fires once
           * `quoteInView` becomes true, rather than on page mount.
           *
           * `as="span"` keeps RevealText's inline layout behaviour correct
           * while the parent <blockquote> provides block/max-width context.
           * stagger 55 ms (vs hero's 140 ms) suits the higher word count.
           */}
          <blockquote className="mx-auto mt-8 max-w-3xl font-heading text-title font-normal italic leading-snug text-[var(--ink)] sm:text-[2rem]">
            <RevealText
              as="span"
              gated
              ready={quoteInView}
              stagger={prefersReducedMotion ? 0 : 55}
              duration={prefersReducedMotion ? 0 : 0.85}
            >
              {quote}
            </RevealText>
          </blockquote>

          {/*
           * Attribution — Inview rise-in with a 600 ms delay so it arrives
           * after the first wave of quote words has revealed.
           */}
          {attribution && (
            <Inview
              delayIn={600}
              stiffness={200}
              damping={26}
              from={{ opacity: 0, y: 12 }}
              to={{ opacity: 1, y: 0 }}
            >
              <figcaption className="mt-8">
                <p className="font-body text-caption uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  {attribution}
                </p>
              </figcaption>
            </Inview>
          )}
        </figure>

        {/* Certification chips — inline hairline row */}
        {certBadges && certBadges.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {certBadges.map((badge, i) => (
              <Inview
                key={badge.name}
                delayIn={i * 90}
                stiffness={200}
                damping={26}
                from={{ opacity: 0, y: 14 }}
                to={{ opacity: 1, y: 0 }}
              >
                <span className="inline-flex items-center gap-2 rounded-pill border border-[var(--hairline)] px-4 py-2 font-body text-xs text-[var(--ink)]">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand)]"
                    aria-hidden="true"
                  />
                  {badge.name}
                  {badge.issuingBody && (
                    <span className="text-[var(--ink-soft)]">
                      &middot; {badge.issuingBody}
                    </span>
                  )}
                </span>
              </Inview>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
