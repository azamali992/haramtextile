"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { RevealText } from "@/components/motion/RevealText";
import { RevealLines } from "@/components/motion/RevealLines";
import { Parallax } from "@/components/motion/Parallax";
import { PillButton } from "@/components/ui/PillButton";
import { useLoader } from "@/components/layout/Loader";
import { useUI } from "@/components/layout/UIProvider";

interface HeroSectionProps {
  headline: string;
  subtext: string;
  ctaText: string;
  ctaLink: string | null;
  /** Resolved hero image URL (fallback already applied by the server). */
  heroImage: string;
}

const FOUNDED_YEAR = 2009;

/**
 * Full-height editorial hero: deep-green rounded card, parallax factory
 * photo, giant sentence-case Playfair headline (final word italic gold),
 * two-line tagline, CTA pill, and a quiet provenance line with a scroll cue.
 */
export function HeroSection({
  headline,
  subtext,
  ctaText,
  ctaLink,
  heroImage,
}: HeroSectionProps) {
  const { ready } = useLoader();
  const { openContact } = useUI();
  const prefersReducedMotion = useReducedMotion();

  /*
   * Scroll-consequence layer: as the hero exits the viewport (scrollYProgress
   * goes 0 → 1), the headline floats upward at ~40 % of scroll speed while
   * the bottom row (tagline + CTA + provenance) fades out before it's clipped.
   * All transforms use GPU-composited properties only (transform + opacity).
   * Reduced-motion: all output ranges collapse to static values.
   */
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Headline drifts up at 40 % of page scroll speed — reads as "sticking"
  const headlineY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -40],
  );

  // Bottom row (tagline + CTA) fades out by 65 % scroll and slides up slightly
  const bottomOpacity = useTransform(
    scrollYProgress,
    [0, 0.65],
    prefersReducedMotion ? [1, 1] : [1, 0],
  );
  const bottomY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -24],
  );

  const yearsOperating = new Date().getFullYear() - FOUNDED_YEAR;

  // Determine tagline lines from subtext (split at comma or midpoint)
  const taglineLines = (() => {
    if (!subtext) return ["Crafted for", "Global Markets"];
    const commaIdx = subtext.indexOf(",");
    if (commaIdx > 0 && commaIdx < subtext.length - 1) {
      return [
        subtext.slice(0, commaIdx + 1).trim().replace(/,$/, ""),
        subtext.slice(commaIdx + 1).trim(),
      ];
    }
    const mid = Math.ceil(subtext.length / 2);
    const spaceIdx = subtext.indexOf(" ", mid);
    if (spaceIdx > 0) {
      return [subtext.slice(0, spaceIdx).trim(), subtext.slice(spaceIdx).trim()];
    }
    return [subtext];
  })();

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[36rem] flex-col overflow-hidden rounded-card-lg bg-brand-deep text-[var(--on-brand)]"
      style={{ minHeight: "calc(100svh - 1rem)" }}
      aria-label="Hero"
    >
      {/* ── Parallax background plate — range increased to 22 % for deeper
           layer separation against the headline drift above.               ── */}
      <div className="absolute inset-0 -z-10">
        <Parallax range={["0%", "22%"]}>
          <Image
            src={heroImage}
            alt="Haram Textile factory floor — a world-class garment manufacturing facility in Faisalabad, Pakistan"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "center" }}
          />
          {/* Soft circular vignette — a quiet radial highlight behind the
              headline, echoing a photo-mask motif without literally
              cropping a landscape factory photo into a circle. */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[70%] max-w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle, rgb(var(--on-brand-rgb)/0.16) 0%, rgb(var(--on-brand-rgb)/0.06) 45%, transparent 72%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-scrim/75 via-scrim/40 to-scrim/85"
            aria-hidden="true"
          />
        </Parallax>
      </div>

      {/* ── Giant headline — drifts upward at ~40 % of scroll speed ── */}
      {/* pt-24 (6rem) clears the absolute site header (h-20 = 5rem) with a 1rem buffer */}
      <motion.div
        className="px-6 pt-24 sm:px-10 sm:pt-28"
        style={{ y: headlineY }}
      >
        <RevealText
          as="h1"
          stagger={140}
          duration={1.1}
          gated
          ready={ready}
          className="max-w-[11em] font-heading font-normal text-display-xl"
          accentLastWord="italic text-[var(--brand-light)]"
        >
          {headline}
        </RevealText>
      </motion.div>

      {/* ── Bottom row — fades + lifts as hero exits the viewport ── */}
      <motion.div
        className="mt-auto px-6 pb-8 sm:px-10 sm:pb-10"
        style={{ opacity: bottomOpacity, y: bottomY }}
      >
        <div className="flex flex-col items-start gap-10 sm:flex-row sm:items-end sm:justify-between">
          {/* Tagline + CTA */}
          <div className="max-w-2xl">
            <RevealLines
              lines={taglineLines}
              stagger={110}
              duration={0.9}
              baseDelay={350}
              className="font-heading text-title tracking-tight text-on-brand/85"
              lineClassName="block"
              animationKey={ready ? "ready" : "waiting"}
            />
            <motion.div
              className="mt-7"
              initial={{ opacity: 0, y: 16 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 200, damping: 26, delay: 0.6 }}
            >
              {ctaLink ? (
                <PillButton variant="light" href={ctaLink}>
                  {ctaText || "Get a Quote"}
                </PillButton>
              ) : (
                <PillButton variant="light" onClick={openContact}>
                  {ctaText || "Get a Quote"}
                </PillButton>
              )}
            </motion.div>
          </div>

          {/* Quiet provenance line + scroll cue */}
          <motion.div
            className="hidden flex-col items-end gap-6 sm:flex"
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
          >
            <p className="font-body text-caption uppercase tracking-[0.18em] text-on-brand/70">
              {yearsOperating}+ years &middot; Faisalabad, Pakistan
            </p>
            <div
              className="relative h-16 w-px overflow-hidden bg-on-brand/20"
              aria-hidden="true"
            >
              <motion.span
                className="absolute left-0 top-0 h-6 w-px bg-[var(--brand-light)]"
                animate={
                  prefersReducedMotion ? undefined : { y: ["-100%", "280%"] }
                }
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.6,
                }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
