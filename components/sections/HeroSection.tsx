"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { RevealText } from "@/components/motion/RevealText";
import { RevealLines } from "@/components/motion/RevealLines";
import { Inview } from "@/components/motion/Inview";
import { CarouselDots } from "@/components/ui/CarouselDots";
import { PillButton } from "@/components/ui/PillButton";
import { useLoader } from "@/components/layout/Loader";
import { useUI } from "@/components/layout/UIProvider";
import { useScrollParallax } from "@/components/motion/useScrollParallax";
import type { SiteContentStat } from "@/lib/site-content";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CollectionSlide {
  /** Category slug used to build href="/products?category={slug}". */
  slug: string;
  /** Display name for the category. */
  name: string;
  /** Short intro/description for the category. */
  intro: string;
  /** Cover image (first fallback photo for the category). */
  image: { src: string; width: number; height: number };
}

interface HeroSectionProps {
  headline: string;
  subtext: string;
  ctaText: string;
  ctaLink: string | null;
  /** Resolved hero image URL (fallback already applied by the server). */
  heroImage: string;
  /** One slide per product category (deduped). */
  slides: CollectionSlide[];
  /** All stats for the headline stat card. */
  stats: SiteContentStat[];
}

// ─── Auto-advance interval ────────────────────────────────────────────────────
const AUTOPLAY_INTERVAL_MS = 3800;

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Full-bleed deep-green hero section.
 *
 * - Parallax background image plate (useScrollParallax, 0% → 12%)
 * - Giant Playfair headline word-reveal gated on loader `ready`
 * - Tagline via RevealLines (2 lines)
 * - Glass category slider (auto-advancing, CarouselDots)
 * - Glass headline stat card
 * - PillButton CTA (opens contact modal or navigates)
 */
export function HeroSection({
  headline,
  subtext,
  ctaText,
  ctaLink,
  heroImage,
  slides,
  stats,
}: HeroSectionProps) {
  const { ready } = useLoader();
  const { openContact } = useUI();
  const { ref: parallaxRef, value: parallaxY } =
    useScrollParallax<HTMLDivElement>({ outputRange: ["0%", "12%"] });

  // ── Carousel state ────────────────────────────────────────────────────────
  const [activeSlide, setActiveSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Headline stat — prefer packing capacity
  const headlineStat =
    stats.find((s) => s.label === "Packing capacity (Pcs/month)") ?? stats[0];

  const formattedStatValue = headlineStat
    ? headlineStat.label.includes("Pcs") || headlineStat.value >= 100_000
      ? `${Math.round(headlineStat.value / 1000)}K+`
      : String(headlineStat.value)
    : "";

  // Start autoplay once loader is ready
  useEffect(() => {
    if (!ready || slides.length <= 1) return;
    setIsVisible(true);

    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [ready, slides.length]);

  const handleSlideChange = (index: number) => {
    setActiveSlide(index);
    // Reset autoplay timer on manual change
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (slides.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % slides.length);
      }, AUTOPLAY_INTERVAL_MS);
    }
  };

  // Determine tagline lines from subtext (split at comma or midpoint)
  const taglineLines = (() => {
    if (!subtext) return ["Crafted for", "Global Markets"];
    const commaIdx = subtext.indexOf(",");
    if (commaIdx > 0 && commaIdx < subtext.length - 1) {
      return [subtext.slice(0, commaIdx + 1).trim(), subtext.slice(commaIdx + 1).trim()];
    }
    const mid = Math.ceil(subtext.length / 2);
    const spaceIdx = subtext.indexOf(" ", mid);
    if (spaceIdx > 0) {
      return [subtext.slice(0, spaceIdx).trim(), subtext.slice(spaceIdx).trim()];
    }
    return [subtext];
  })();

  const currentSlide = slides[activeSlide];

  return (
    <section
      className="relative isolate flex min-h-[36rem] flex-col overflow-hidden rounded-[var(--radius-card-lg)] bg-[var(--brand-deep)] text-[var(--on-brand)]"
      style={{ minHeight: "calc(100svh - 1rem)" }}
      aria-label="Hero"
    >
      {/* ── Parallax background plate ── */}
      <div className="absolute inset-0 -z-10">
        <div
          ref={parallaxRef}
          className="absolute inset-x-0 w-full"
          style={{ top: "-16%", height: "132%" }}
        >
          <motion.div className="h-full w-full" style={{ y: parallaxY }}>
            <Image
              src={heroImage}
              alt="Haram Textile factory floor — a world-class garment manufacturing facility in Faisalabad, Pakistan"
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center" }}
            />
          </motion.div>
          {/* Gradient overlay in green tints */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(31,58,15,0.72), rgba(31,58,15,0.45), rgba(31,58,15,0.82))",
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ── Giant headline ── */}
      {/* pt-24 (6rem) clears the absolute site header (h-20 = 5rem) with a 1rem buffer */}
      <div className="px-6 pt-24 sm:px-10 sm:pt-28">
        <RevealText
          as="h1"
          stagger={140}
          duration={1.1}
          gated
          ready={ready}
          className="font-heading font-medium uppercase leading-[0.85] tracking-tight"
          motionProps={{
            style: { fontSize: "clamp(1.5rem, 6.25vw, 7rem)" },
          }}
        >
          {headline}
        </RevealText>
      </div>

      {/* ── Bottom row ── */}
      <div className="mt-auto px-6 pb-8 sm:px-10 sm:pb-10">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          {/* Tagline */}
          <div>
            <RevealLines
              lines={taglineLines}
              stagger={110}
              duration={0.9}
              baseDelay={350}
              className="font-heading font-medium uppercase tracking-tight text-[rgba(253,250,246,0.85)]"
              lineClassName="block"
              animationKey={ready ? "ready" : "waiting"}
            />
            {/* CTA pill — shown only after loader ready */}
            <motion.div
              className="mt-6"
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

          {/* Right cluster — collection slider + stat card */}
          <div className="hidden items-end gap-4 md:flex">
            {/* Collection slider */}
            {slides.length > 0 && currentSlide && (
              <Inview
                delayIn={650}
                stiffness={200}
                damping={26}
                from={{ opacity: 0, y: 28 }}
                to={{ opacity: 1, y: 0 }}
                className="w-64 flex-col gap-3"
              >
                {/* Card */}
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 210, damping: 24 }}
                  className="flex gap-3 rounded-[var(--radius-card)] border border-white/15 bg-white/10 p-3 shadow-[0_4px_24px_rgba(31,58,15,0.2)] backdrop-blur-sm"
                >
                  {/* Thumbnail */}
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={currentSlide.image.src}
                      alt={currentSlide.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-[0.7rem] font-medium uppercase tracking-wide text-[var(--on-brand)]">
                      Haram Textile
                    </p>
                    <p className="font-body text-[0.7rem] uppercase text-[rgba(253,250,246,0.8)]">
                      {currentSlide.name}
                    </p>
                    <Link
                      href={`/products?category=${currentSlide.slug}`}
                      className="mt-1 block font-body text-[0.65rem] underline text-[rgba(253,250,246,0.75)] hover:text-[var(--on-brand)] transition-colors duration-150"
                    >
                      View collection &rarr;
                    </Link>
                  </div>
                </motion.div>

                {/* Dots */}
                <CarouselDots
                  count={slides.length}
                  activeIndex={activeSlide}
                  onChange={handleSlideChange}
                  tone="light"
                  className="mt-3"
                />
              </Inview>
            )}

            {/* Headline stat card */}
            {headlineStat && (
              <Inview
                delayIn={780}
                stiffness={200}
                damping={26}
                from={{ opacity: 0, y: 28 }}
                to={{ opacity: 1, y: 0 }}
              >
                <article className="flex max-w-[15rem] gap-3 rounded-[var(--radius-card)] border border-white/15 bg-white/10 p-3 shadow-[0_4px_24px_rgba(31,58,15,0.2)] backdrop-blur-sm">
                  <div className="flex flex-col justify-between">
                    <span className="font-heading text-[1.875rem] leading-none font-medium text-[var(--on-brand)]">
                      {formattedStatValue}
                    </span>
                    {/* Avatar dots */}
                    <div className="flex -space-x-2">
                      {["#4A7C2F", "#B8963E", "#2D5016", "#FDFAF6"].map(
                        (color, i) => (
                          <span
                            key={i}
                            className="inline-block size-5 rounded-full border border-[rgba(31,58,15,0.4)]"
                            style={{ backgroundColor: color }}
                            aria-hidden="true"
                          />
                        )
                      )}
                    </div>
                    <span className="font-body text-[0.65rem] text-[rgba(253,250,246,0.8)]">
                      Pcs / month
                    </span>
                  </div>
                </article>
              </Inview>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
