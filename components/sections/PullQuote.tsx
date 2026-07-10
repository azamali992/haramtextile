"use client";

import { Inview } from "@/components/motion/Inview";
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
 * Centered editorial pull-quote: oversized gold quote glyph, large italic
 * Playfair blockquote between hairlines, quiet attribution, and an inline
 * row of hairline certification chips. No cards, no boxes.
 */
export function PullQuote({
  eyebrow,
  title,
  quote,
  attribution,
  certBadges,
  className = "",
}: PullQuoteProps) {
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

        <Inview
          stiffness={180}
          damping={26}
          from={{ opacity: 0, y: 32 }}
          to={{ opacity: 1, y: 0 }}
        >
          <figure className="border-y border-[var(--hairline)] py-14 sm:py-16">
            {/* Oversized opening quote glyph */}
            <span
              className="block font-heading text-[4.5rem] leading-[0.5] text-[var(--brand)]"
              aria-hidden="true"
            >
              &ldquo;
            </span>

            <blockquote className="mx-auto mt-8 max-w-3xl font-heading text-title font-normal italic leading-snug text-[var(--ink)] sm:text-[2rem]">
              {quote}
            </blockquote>

            {attribution && (
              <figcaption className="mt-8">
                <p className="font-body text-caption uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  {attribution}
                </p>
              </figcaption>
            )}
          </figure>
        </Inview>

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
