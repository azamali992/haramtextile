"use client";

import Image from "next/image";
import { RevealText } from "@/components/motion/RevealText";
import { Parallax } from "@/components/motion/Parallax";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface PhotoHeroProps {
  /** Small kicker above the headline. */
  eyebrow?: string;
  /** Headline text — final word rendered italic gold. */
  title: string;
  /** Optional supporting line under the headline. */
  subtitle?: string;
  /** Background photo. */
  imageSrc: string;
  imageAlt: string;
  /**
   * Heading level for the title. Inner pages that keep an sr-only h1
   * elsewhere should pass "p".
   * @default "h1"
   */
  as?: "h1" | "p";
  className?: string;
}

/**
 * Inner-page photo hero: a rounded deep-green band with a parallax photo,
 * scrim gradient, and a large sentence-case Playfair headline with an italic
 * gold accent word. Shorter than the home hero — a chapter opener, not a cover.
 */
export function PhotoHero({
  eyebrow,
  title,
  subtitle,
  imageSrc,
  imageAlt,
  as = "h1",
  className = "",
}: PhotoHeroProps) {
  return (
    <section
      className={`relative isolate flex min-h-[24rem] flex-col justify-end overflow-hidden rounded-card-lg bg-brand-deep text-[var(--on-brand)] sm:min-h-[30rem] ${className}`}
      aria-label={title}
    >
      <div className="absolute inset-0 -z-10">
        <Parallax>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-scrim/55 via-scrim/35 to-scrim/85"
            aria-hidden="true"
          />
        </Parallax>
      </div>

      <div className="px-6 pb-10 pt-24 sm:px-10 sm:pb-12">
        {eyebrow && <Eyebrow tone="light">{eyebrow}</Eyebrow>}
        <div className="mt-4 max-w-3xl">
          <RevealText
            as={as}
            stagger={110}
            duration={1}
            className="font-heading font-normal text-[2.75rem] leading-[0.95] tracking-tight sm:text-display-lg"
            accentLastWord="italic text-[var(--brand-light)]"
          >
            {title}
          </RevealText>
        </div>
        {subtitle && (
          <p className="mt-5 max-w-xl font-body text-body text-on-brand/85">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
