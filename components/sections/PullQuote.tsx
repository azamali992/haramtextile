"use client";

import { Inview } from "@/components/motion/Inview";
import { HoverSpring } from "@/components/motion/HoverSpring";
import { Eyebrow } from "@/components/ui/Eyebrow";

export interface PullQuoteCertBadge {
  /** Short certification name shown as a badge. */
  name: string;
  /** Optional issuing body shown below the name. */
  issuingBody?: string | null;
}

interface PullQuoteProps {
  /** Eyebrow kicker above the headline. */
  eyebrow?: string;
  /** Section header lines (RevealLines-style, but used as static display here). */
  title?: string[];
  /**
   * The pull-quote text (without surrounding quotation marks — the component
   * renders the opening quote glyph).
   */
  quote: string;
  /** Attribution line, e.g. "Rashid Mehmood, CEO — Haram Textile". */
  attribution?: string;
  /** Optional list of certification badges to show as trust markers. */
  certBadges?: PullQuoteCertBadge[];
  /** Extra classes on the outer `<section>`. */
  className?: string;
}

/**
 * Repurposed "testimonials" slot per CHANGES.md decision: no testimonial model
 * exists in the DB, so we render the founder/company quote from
 * `siteContent.site.quote` as a large brand blockquote alongside certification
 * badges as trust markers.
 *
 * Prop API (for Phase 3b reuse on About page):
 * ```
 * eyebrow?:      string
 * title?:        string[]
 * quote:         string        — the pull-quote body
 * attribution?:  string        — "Name, Role — Company"
 * certBadges?:   { name, issuingBody? }[]
 * className?:    string
 * ```
 *
 * @example
 * <PullQuote
 *   eyebrow="Our commitment"
 *   title={["Trusted by", "global brands"]}
 *   quote={siteContent.site.quote}
 *   attribution="Rashid Mehmood, CEO — Haram Textile"
 *   certBadges={certifications.map(c => ({ name: c.name, issuingBody: c.issuingBody }))}
 * />
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
      className={`bg-[var(--background)] px-6 py-20 sm:px-10 sm:py-24 ${className}`}
    >
      <div className="mx-auto max-w-[90rem]">
        {/* Header */}
        {(eyebrow || (title && title.length > 0)) && (
          <div className="mb-14">
            {eyebrow && <Eyebrow tone="dark">{eyebrow}</Eyebrow>}
            {title && title.length > 0 && (
              <div className="mt-4">
                {title.map((line, i) => (
                  <p
                    key={i}
                    className="font-heading text-[3rem] leading-[0.95] tracking-tight text-[var(--ink)]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Pull-quote card (spans 2 cols) */}
          <Inview
            delayIn={0}
            stiffness={180}
            damping={26}
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            className="md:col-span-2"
          >
            <HoverSpring to={{ y: -8 }} stiffness={300} damping={22}>
              <figure className="flex h-full flex-col justify-between rounded-[var(--radius-card)] bg-[var(--surface)] p-7">
                {/* Opening quote glyph */}
                <span
                  className="font-heading text-[2.25rem] leading-none text-[var(--brand)]"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>

                <blockquote className="mt-4 font-heading text-xl leading-relaxed text-[var(--ink)] sm:text-[1.5rem]">
                  {quote}
                </blockquote>

                {attribution && (
                  <figcaption className="mt-6 border-t border-[var(--hairline)] pt-4">
                    <p className="font-body text-sm font-medium text-[var(--ink)]">
                      {attribution}
                    </p>
                  </figcaption>
                )}
              </figure>
            </HoverSpring>
          </Inview>

          {/* Certification badges column */}
          {certBadges && certBadges.length > 0 && (
            <div className="flex flex-col gap-4">
              {certBadges.map((badge, i) => (
                <Inview
                  key={badge.name}
                  delayIn={i * 120}
                  stiffness={180}
                  damping={26}
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                >
                  <HoverSpring to={{ y: -8 }} stiffness={300} damping={22}>
                    <div className="rounded-[var(--radius-card)] bg-[var(--surface)] p-7">
                      {/* Gold dot accent */}
                      <span
                        className="block h-2 w-2 rounded-full bg-[var(--brand)]"
                        aria-hidden="true"
                      />
                      <p className="mt-4 font-heading text-lg font-medium leading-snug text-[var(--ink)]">
                        {badge.name}
                      </p>
                      {badge.issuingBody && (
                        <p className="mt-1 font-body text-sm text-[var(--ink-soft)]">
                          {badge.issuingBody}
                        </p>
                      )}
                    </div>
                  </HoverSpring>
                </Inview>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
