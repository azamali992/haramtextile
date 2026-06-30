"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Inview } from "@/components/motion/Inview";
import { RevealLines } from "@/components/motion/RevealLines";
import { Eyebrow } from "@/components/ui/Eyebrow";

export interface TileData {
  /** Absolute or root-relative image URL. */
  src: string;
  /** Accessible alt text. */
  alt: string;
  /** Caption name / title shown in the glass overlay. */
  name: string;
  /** Short description in the caption. */
  description: string;
  /**
   * Caption tint: `green` = brand-deep @ 40%, `gold` = brand @ 55%.
   * @default "green"
   */
  tone?: "green" | "gold";
}

interface IntroData {
  /** Eyebrow kicker above the headline. */
  eyebrow?: string;
  /** Stacked headline lines. */
  title: string[];
  /** Body paragraph below the headline. */
  body: string;
  /**
   * Optional small square icon image shown above the headline (e.g. a
   * product or facility thumbnail).
   */
  iconImage?: { src: string; alt: string };
}

interface TiltedPhotoPairProps {
  /** Left/intro column data. */
  intro: IntroData;
  /** The two photo tiles. First is rendered naturally; second is offset upward. */
  tiles: [TileData, TileData];
  /** Extra classes on the outer `<section>`. */
  className?: string;
}

/**
 * Reference "Facilities tilted photo pair" pattern: an intro text column
 * on the left + two 3/4-aspect-ratio photo cards on the right. The second
 * card is offset upward (`mb-8`) to create a staggered baseline.
 *
 * Each photo card has a hover-scale spring (`1 → 1.03`) and a glass
 * caption overlay. Cards enter via Inview rise-in (delayIn i × 140ms).
 *
 * Used on Home (Production Steps/Facilities) and reusable for About /
 * Production pages.
 *
 * Prop API (for Phase 3b reuse):
 * ```
 * intro: {
 *   eyebrow?:    string
 *   title:       string[]
 *   body:        string
 *   iconImage?:  { src, alt }
 * }
 * tiles: [TileData, TileData]   — exactly two tiles
 * className?: string
 *
 * TileData: { src, alt, name, description, tone?: "green" | "gold" }
 * ```
 *
 * @example
 * <TiltedPhotoPair
 *   intro={{ eyebrow: "Our process", title: ["Built to", "perform"], body: "…" }}
 *   tiles={[
 *     { src: "/images/knitting.jpg", alt: "Knitting floor", name: "Knitting", description: "…", tone: "green" },
 *     { src: "/images/sewing.jpg",   alt: "Sewing floor",   name: "Sewing",   description: "…", tone: "gold"  },
 *   ]}
 * />
 */
export function TiltedPhotoPair({
  intro,
  tiles,
  className = "",
}: TiltedPhotoPairProps) {
  return (
    <section
      id="facilities"
      className={`rounded-[var(--radius-card-lg)] bg-[var(--background)] -mt-10 px-6 pb-20 pt-16 sm:px-10 ${className}`}
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-2">
          {/* ── Intro column ── */}
          <div className="max-w-96">
            {intro.iconImage && (
              <Inview
                from={{ opacity: 0, scale: 0.85 }}
                to={{ opacity: 1, scale: 1 }}
                stiffness={240}
                damping={20}
              >
                <div className="relative size-16 overflow-hidden rounded-[var(--radius-card)]">
                  <Image
                    src={intro.iconImage.src}
                    alt={intro.iconImage.alt}
                    fill
                    sizes="64px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              </Inview>
            )}

            {intro.eyebrow && (
              <Eyebrow tone="dark" className="mt-6">
                {intro.eyebrow}
              </Eyebrow>
            )}

            <RevealLines
              lines={intro.title}
              stagger={120}
              duration={0.95}
              className="mt-6 font-heading text-[3rem] leading-[0.95] tracking-tight text-[var(--ink)]"
            />

            <p className="mt-6 max-w-80 font-body text-sm leading-relaxed text-[var(--ink-soft)]">
              {intro.body}
            </p>
          </div>

          {/* ── Photo pair ── */}
          <div className="flex items-end gap-5">
            {tiles.map((tile, i) => {
              const captionBg =
                tile.tone === "gold"
                  ? "bg-[var(--brand)]/55"
                  : "bg-[var(--brand-deep)]/40";

              return (
                <Inview
                  key={tile.name}
                  delayIn={i * 140}
                  stiffness={180}
                  damping={26}
                  from={{ opacity: 0, y: 48 }}
                  to={{ opacity: 1, y: 0 }}
                  className={`flex-1 ${i === 1 ? "mb-8" : ""}`}
                >
                  <motion.figure
                    className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-[var(--surface)]"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  >
                    <Image
                      src={tile.src}
                      alt={tile.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                      loading="lazy"
                    />
                    {/* Glass caption */}
                    <figcaption
                      className={`absolute inset-x-3 bottom-3 rounded-[var(--radius-card)] ${captionBg} p-3 backdrop-blur-sm`}
                    >
                      <p className="font-body text-sm font-medium text-[var(--on-brand)]">
                        {tile.name}
                      </p>
                      <p className="mt-0.5 line-clamp-2 font-body text-[0.65rem] leading-snug text-[rgba(253,250,246,0.85)]">
                        {tile.description}
                      </p>
                    </figcaption>
                  </motion.figure>
                </Inview>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
