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
   * `green` — deep-green bg (`--brand-deep`), on-brand text.
   * `cream` — cream surface bg, ink text.
   * @default "green"
   */
  tone?: "green" | "cream";
  /** Extra classes on the outer `<section>`. */
  className?: string;
}

/**
 * Statistics band: Eyebrow + RevealLines title + a responsive `<dl>` grid of
 * stat cells. Values count up from 0 on first view (CountUp, Playfair), each
 * cell topped with a gold hairline.
 */
export function StatBand({
  eyebrow,
  title,
  stats,
  tone = "green",
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

        {/* Stats grid */}
        <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Inview
              key={stat.label}
              delayIn={i * 110}
              stiffness={180}
              damping={24}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
            >
              <div className="border-t border-[var(--brand)] pt-5">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <CountUp
                    value={stat.value}
                    className={`block font-heading text-[3.75rem] leading-none tracking-tight sm:text-[4.5rem] ${valueColor}`}
                  />
                  <span className={`mt-3 block font-body text-sm ${labelColor}`}>
                    {stat.label}
                  </span>
                </dd>
              </div>
            </Inview>
          ))}
        </dl>
      </div>
    </section>
  );
}
