"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Inview } from "@/components/motion/Inview";
import { Parallax } from "@/components/motion/Parallax";
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
  /**
   * When set, renders a full-bleed dark photo band (matching the site's
   * other full-bleed dark sections) with the quote overlaid in light text,
   * instead of the light hairline-card variant. Expects a page-relative
   * image path, e.g. "/images/about/about-factory.jpg".
   */
  photoBackground?: string;
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
 *
 * With `photoBackground` set, the same sequence renders over a full-bleed
 * dark parallax photo (bleeding past the page inset via negative margins)
 * instead of the light hairline-card treatment.
 */
export function PullQuote({
  eyebrow,
  title,
  quote,
  attribution,
  certBadges,
  photoBackground,
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

  const isPhoto = Boolean(photoBackground);
  const eyebrowTone = isPhoto ? "light" : "dark";
  const titleColor = isPhoto ? "text-[var(--on-brand)]" : "text-[var(--ink)]";
  const borderColor = isPhoto ? "border-white/20" : "border-[var(--hairline)]";
  const glyphColor = isPhoto ? "text-[var(--brand-light)]" : "text-[var(--brand)]";
  const quoteColor = isPhoto ? "text-[var(--on-brand)]" : "text-[var(--ink)]";
  const attributionColor = isPhoto ? "text-on-brand/70" : "text-[var(--ink-soft)]";
  const badgeBorder = isPhoto ? "border-white/25" : "border-[var(--hairline)]";
  const badgeText = isPhoto ? "text-[var(--on-brand)]" : "text-[var(--ink)]";
  const badgeSubtext = isPhoto ? "text-on-brand/65" : "text-[var(--ink-soft)]";
  const badgeDot = isPhoto ? "bg-[var(--brand-light)]" : "bg-[var(--brand)]";

  return (
    <section
      id="testimonials"
      className={
        isPhoto
          ? `relative -mx-2 overflow-hidden sm:-mx-3 ${className}`
          : `bg-[var(--background)] px-6 py-24 sm:px-10 sm:py-32 ${className}`
      }
      style={isPhoto ? { minHeight: "60vh" } : undefined}
    >
      {isPhoto && (
        <div className="absolute inset-0">
          <Parallax range={["0%", "15%"]}>
            <Image
              src={photoBackground as string}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              loading="lazy"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-scrim/60 via-scrim/55 to-scrim/80"
              aria-hidden="true"
            />
          </Parallax>
        </div>
      )}

      <div
        className={
          isPhoto
            ? "relative flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center sm:px-10"
            : ""
        }
      >
        <div className="mx-auto max-w-4xl text-center">
          {/* Optional header */}
          {(eyebrow || (title && title.length > 0)) && (
            <div className="mb-14">
              {eyebrow && <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>}
              {title && title.length > 0 && (
                <div className="mt-4">
                  {title.map((line, i) => (
                    <p
                      key={i}
                      className={`font-heading font-normal text-display ${titleColor}`}
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
            className={`border-y py-14 sm:py-16 ${borderColor}`}
          >
            {/*
             * Opening quote glyph — springs in from scale(0.5) + rotate(-15°).
             * Controlled by quoteInView (same trigger as the word reveals).
             * prefers-reduced-motion: transition duration collapses to 0.
             */}
            <motion.span
              className={`block font-heading text-[4.5rem] leading-[0.5] ${glyphColor}`}
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
            <blockquote
              className={`mx-auto mt-8 max-w-3xl font-heading text-title font-normal italic leading-snug sm:text-[2rem] ${quoteColor}`}
            >
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
                  <p
                    className={`font-body text-caption uppercase tracking-[0.18em] ${attributionColor}`}
                  >
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
                  <span
                    className={`inline-flex items-center gap-2 rounded-pill border px-4 py-2 font-body text-xs ${badgeBorder} ${badgeText}`}
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${badgeDot}`}
                      aria-hidden="true"
                    />
                    {badge.name}
                    {badge.issuingBody && (
                      <span className={badgeSubtext}>
                        &middot; {badge.issuingBody}
                      </span>
                    )}
                  </span>
                </Inview>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
