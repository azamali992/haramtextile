"use client";

import { Eyebrow, type EyebrowTone } from "@/components/ui/Eyebrow";
import { RevealLines } from "@/components/motion/RevealLines";
import { Inview } from "@/components/motion/Inview";
import { CountUp } from "@/components/motion/CountUp";

export interface StatItem {
  /** Display value, e.g. "220" or "600K+" or "30,000". */
  value: string;
  /** Human label, e.g. "Specialized machines". */
  label: string;
}

interface StatBandProps {
  /** Optional eyebrow kicker above the title. */
  eyebrow?: string;
  /**
   * Title lines fed into RevealLines. Typically 2 short strings.
   * @example ["A factory that", "keeps delivering"]
   */
  title: string[];
  /** The stat cells to display. 4–5 recommended. */
  stats: StatItem[];
  /**
   * Visual tone of the band.
   * `green` - deep-green bg (`--brand-deep`), on-brand text.
   * `cream` - cream surface bg, ink text.
   * @default "green"
   */
  tone?: "green" | "cream";
  /**
   * `bento` - first stat is "featured" (spans 2 cols, larger CountUp).
   * `row` - 4 equal-width columns, each with a small `01`–`04` numeral above
   * the value. No featured stat.
   * @default "bento"
   */
  layout?: "bento" | "row";
  /** Extra classes on the outer `<section>`. */
  className?: string;
}

/**
 * Statistics band: Eyebrow + RevealLines title + a stats `<dl>` grid.
 * `layout="bento"` (default): the first stat is the "hero stat" - it spans
 * two grid columns and counts up at a slower 2.2 s duration with a larger
 * type size, remaining stats sit at standard size beside/below it.
 * `layout="row"`: 4 equal-width numbered columns (01–04), no featured stat.
 * All values animate from 0 on first viewport entry via CountUp.
 */
export function StatBand({
  eyebrow,
  title,
  stats,
  tone = "green",
  layout = "bento",
  className = "",
}: StatBandProps) {
  const isGreen = tone === "green";

  const eyebrowTone: EyebrowTone = isGreen ? "light" : "dark";
  const sectionBg = isGreen ? "bg-brand-deep" : "bg-[var(--surface)]";
  const titleColor = isGreen ? "text-[var(--on-brand)]" : "text-[var(--ink)]";
  const valueColor = isGreen ? "text-[var(--on-brand)]" : "text-[var(--ink)]";
  const labelColor = isGreen ? "text-on-brand/80" : "text-[var(--ink-soft)]";

  return (
    <section
      className={`rounded-card-lg px-6 py-24 sm:px-10 ${sectionBg} ${className}`}
    >
      <div className="mx-auto max-w-[90rem]">
        {/* Header */}
        {eyebrow && <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>}
        <RevealLines
          lines={title}
          stagger={120}
          duration={0.95}
          className={`mt-4 font-heading font-normal text-display ${titleColor}`}
        />

        {layout === "row" ? (
          /*
           * Numbered row - 4 equal-width columns, each headed by a small
           * Playfair "01"–"04" numeral above the CountUp value. No featured
           * stat.
           */
          <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Inview
                key={stat.label}
                delayIn={Math.min(i * 110, 330)}
                stiffness={180}
                damping={24}
                from={{ opacity: 0, y: 30 }}
                to={{ opacity: 1, y: 0 }}
              >
                <div className="h-full border-t border-[var(--brand)] pt-5">
                  <span
                    className={`block font-heading text-sm ${
                      isGreen ? "text-on-brand/50" : "text-[var(--ink-soft)]/70"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <CountUp
                      value={stat.value}
                      duration={1.6}
                      className={`mt-2 block font-heading text-[3.75rem] leading-none tracking-tight sm:text-[4.5rem] ${valueColor}`}
                    />
                    <span className={`mt-3 block font-body text-sm ${labelColor}`}>
                      {stat.label}
                    </span>
                  </dd>
                </div>
              </Inview>
            ))}
          </dl>
        ) : (
          /*
           * Bento stats grid - first stat is "featured" (col-span-2 at every
           * breakpoint) with an oversized CountUp. On mobile (grid-cols-2) the
           * featured stat fills the full row. On desktop (lg:grid-cols-4) it
           * occupies the left half with the remaining stats beside/below it.
           */
          <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
            {stats.map((stat, i) => {
              const isFeatured = i === 0;
              return (
                <Inview
                  key={stat.label}
                  delayIn={Math.min(i * 110, 330)}
                  stiffness={180}
                  damping={24}
                  from={{ opacity: 0, y: 30 }}
                  to={{ opacity: 1, y: 0 }}
                  /* Featured stat spans 2 of 2 cols on mobile (full-width) and
                     2 of 4 cols on desktop (left half of the bento grid).       */
                  className={isFeatured ? "col-span-2 lg:col-span-2" : ""}
                >
                  <div
                    className={`h-full pt-5 ${
                      isFeatured
                        ? "border-t-2 border-[var(--brand)]"
                        : "border-t border-[var(--brand)]"
                    }`}
                  >
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <CountUp
                        value={stat.value}
                        /*
                         * Featured: larger type (up to 6.5 rem on lg) + slower
                         * 2.2 s count-up for maximum visual drama.
                         * Standard: unchanged from previous design.
                         */
                        duration={isFeatured ? 2.2 : 1.6}
                        className={
                          isFeatured
                            ? `block font-heading leading-none tracking-tight ${valueColor} text-[4.5rem] sm:text-[5.5rem] lg:text-[6.5rem]`
                            : `block font-heading text-[3.75rem] leading-none tracking-tight sm:text-[4.5rem] ${valueColor}`
                        }
                      />
                      <span
                        className={`mt-3 block font-body ${labelColor} ${
                          isFeatured ? "text-base" : "text-sm"
                        }`}
                      >
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                </Inview>
              );
            })}
          </dl>
        )}
      </div>
    </section>
  );
}
