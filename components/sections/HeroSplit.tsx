"use client";

import Image from "next/image";
import { PillButton } from "@/components/ui/PillButton";
import { Inview } from "@/components/motion/Inview";
import { useUI } from "@/components/layout/UIProvider";

export interface HeroSplitProps {
  headline: string;
  subtext: string;
  ctaText: string;
  ctaLink: string | null;
  heroImage: string;
}

const FOUNDED_YEAR = 2009;

/**
 * Split-layout hero: cream surface, ~42% left copy column, ~58% right photo
 * panel. Designed as a sibling alternative to HeroSection — never rendered
 * alongside it (both contain exactly one <h1>).
 *
 * Entrance animations cascade via <Inview> (viewport-triggered spring,
 * prefers-reduced-motion handled internally). Decorative leaf blobs are
 * static and aria-hidden.
 */
export function HeroSplit({
  headline,
  subtext,
  ctaText,
  ctaLink,
  heroImage,
}: HeroSplitProps) {
  const { openContact } = useUI();
  const yearsOperating = new Date().getFullYear() - FOUNDED_YEAR;

  return (
    <section
      aria-label="Hero"
      className="relative isolate overflow-hidden rounded-card-lg bg-[var(--surface)]"
    >
      {/* ── Decorative corner leaf blobs — clipped by section overflow-hidden ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: "-80px",
          left: "-80px",
          width: "320px",
          height: "320px",
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          background: "var(--brand-deep)",
          opacity: 0.08,
          filter: "blur(40px)",
          transform: "rotate(-30deg)",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          bottom: "-60px",
          left: "-40px",
          width: "240px",
          height: "240px",
          borderRadius: "60% 40% 40% 60% / 50% 50% 50% 50%",
          background: "var(--brand-deep)",
          opacity: 0.06,
          filter: "blur(32px)",
          transform: "rotate(25deg)",
          zIndex: 0,
        }}
      />

      {/* ── Two-column grid — relative z-10 so content sits above the blobs ── */}
      <div className="relative z-10 grid lg:grid-cols-[5fr_7fr]">
        {/* ── Left column ── */}
        {/*
         * min-w-0 overrides the grid item's default min-width:auto, which
         * would otherwise let intrinsic content (e.g. the nowrap CTA
         * buttons) inflate this column past its track width on narrow
         * viewports - a classic CSS Grid overflow trap.
         */}
        <div className="min-w-0 flex flex-col justify-center px-8 py-14 sm:px-12 sm:py-[4.5rem] lg:px-14 lg:py-20 xl:px-20 xl:py-24">
          {/*
           * Inner wrapper caps line length — all content sections below live
           * inside this 480 px cap.
           */}
          <div className="max-w-[480px]">
            {/* 5A + 5B: Eyebrow label + accent rule — cascade group 1 */}
            <Inview
              delayIn={0}
              from={{ opacity: 0, y: 16 }}
              to={{ opacity: 1, y: 0 }}
              stiffness={200}
              damping={26}
            >
              <p className="font-body text-eyebrow font-bold uppercase tracking-[0.25em] text-[var(--brand-deep)]">
                Premium Garment Manufacturing
              </p>
              <div
                aria-hidden="true"
                className="mt-3 h-0.5 w-12 bg-[var(--brand)]"
              />
            </Inview>

            {/* 5C: Headline — cascade group 2 */}
            <Inview
              delayIn={80}
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              stiffness={200}
              damping={26}
            >
              <h1 className="mt-8 break-words font-heading text-[2.25rem] font-bold leading-[0.98] tracking-tight text-[var(--brand-deep)] text-balance sm:text-[3rem] lg:text-display-lg">
                {headline}
              </h1>
            </Inview>

            {/* 5D: Body paragraph — only rendered when subtext is truthy */}
            {subtext && (
              <Inview
                delayIn={160}
                from={{ opacity: 0, y: 16 }}
                to={{ opacity: 1, y: 0 }}
                stiffness={200}
                damping={26}
              >
                <p className="mt-6 font-body text-body-lg text-[var(--ink-soft)]">
                  {subtext}
                </p>
              </Inview>
            )}

            {/* 5E: CTA button pair — cascade group 4 */}
            <Inview
              delayIn={240}
              from={{ opacity: 0, y: 12 }}
              to={{ opacity: 1, y: 0 }}
              stiffness={200}
              damping={26}
            >
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {ctaLink ? (
                  <PillButton variant="solid" href={ctaLink}>
                    {ctaText || "Get a Quote"}
                  </PillButton>
                ) : (
                  <PillButton variant="solid" onClick={openContact}>
                    {ctaText || "Get a Quote"}
                  </PillButton>
                )}
                <PillButton variant="outline" href="/catalog">
                  View Our Products
                </PillButton>
              </div>
            </Inview>

            {/* 5F: Trust badge row — cascade group 5 */}
            <Inview
              delayIn={320}
              from={{ opacity: 0, y: 12 }}
              to={{ opacity: 1, y: 0 }}
              stiffness={200}
              damping={26}
            >
              <div
                role="list"
                aria-label="Trust highlights"
                className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
              >
                {/* Badge 1: Years of experience — clock icon */}
                <div
                  role="listitem"
                  className="flex items-center gap-2.5 text-[var(--brand-deep)]"
                >
                  <svg
                    aria-hidden="true"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 15 12" />
                  </svg>
                  <span className="font-body text-caption font-medium text-[var(--ink-soft)]">
                    {yearsOperating}+ Years Experience
                  </span>
                </div>

                {/* Badge 2: GOTS Certified — shield-check icon */}
                <div
                  role="listitem"
                  className="flex items-center gap-2.5 text-[var(--brand-deep)]"
                >
                  <svg
                    aria-hidden="true"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3L4 7v4c0 5.5 3.5 9.1 8 10.5 4.5-1.4 8-5 8-10.5V7L12 3z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <span className="font-body text-caption font-medium text-[var(--ink-soft)]">
                    GOTS Certified
                  </span>
                </div>

                {/* Badge 3: Sustainable Manufacturing — leaf icon */}
                <div
                  role="listitem"
                  className="flex items-center gap-2.5 text-[var(--brand-deep)]"
                >
                  <svg
                    aria-hidden="true"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6.5 17.5C5.5 12.5 8.5 7.5 13 6.5c4-.8 7.5 1.5 7.5 5.5 0 4.5-3.5 7.5-8 6.5-3-.6-5-2.5-6-5" />
                    <path d="M6.5 17.5l3.5-6.5" />
                  </svg>
                  <span className="font-body text-caption font-medium text-[var(--ink-soft)]">
                    Sustainable Manufacturing
                  </span>
                </div>
              </div>
            </Inview>
          </div>
        </div>

        {/* ── Right column — photo panel, slides in from the right ── */}
        {/*
         * Inview's motion.div takes the flex/padding classes via className,
         * acting directly as the outer photo-panel wrapper described in spec
         * section 6 — no extra wrapping div needed.
         */}
        <Inview
          delayIn={100}
          from={{ opacity: 0, x: 20 }}
          to={{ opacity: 1, x: 0 }}
          stiffness={180}
          damping={28}
          className="relative flex items-stretch p-6 sm:p-8 lg:p-10"
        >
          <div
            className="relative flex-1 overflow-hidden rounded-card"
            style={{ minHeight: "320px" }}
          >
            <Image
              src={heroImage}
              alt="Haram Textile manufacturing facility, Faisalabad, Pakistan"
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              priority
              className="object-cover object-center"
            />
          </div>
        </Inview>
      </div>
    </section>
  );
}
