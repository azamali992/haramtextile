"use client";

import Image from "next/image";
import { RevealText } from "@/components/motion/RevealText";
import { Inview } from "@/components/motion/Inview";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Parallax } from "@/components/motion/Parallax";

interface AboutHeroProps {
  /** Admin-editable story text (AboutContent.storyText). */
  storyText: string;
  /** Admin-editable hero image URL (AboutContent.imageUrl with fallback applied). */
  imageUrl: string;
}

/**
 * About page hero — light editorial treatment (deliberately different from
 * the home page's dark hero): cream background, giant sentence-case Playfair
 * headline with an italic gold accent, story text, then a full-width
 * cinematic parallax photo with its caption below.
 */
export function AboutHero({ storyText, imageUrl }: AboutHeroProps) {
  return (
    <section
      className="bg-[var(--background)] px-6 pb-24 pt-14 sm:px-10 sm:pt-20"
      aria-label="About Haram Textile"
    >
      <div className="mx-auto max-w-[90rem]">
        <Eyebrow tone="dark">Est. 2009 &middot; Faisalabad, Pakistan</Eyebrow>

        {/* h1 — word-by-word reveal, final word italic gold */}
        <div className="mt-5 max-w-4xl">
          <RevealText
            as="h1"
            stagger={120}
            duration={1.1}
            className="font-heading font-normal text-[3rem] leading-[0.95] tracking-tight text-[var(--ink)] sm:text-display-lg"
            accentLastWord="italic text-[var(--brand-strong)]"
          >
            About Haram Textile
          </RevealText>
        </div>

        {/* Story */}
        <Inview
          delayIn={100}
          stiffness={190}
          damping={26}
          from={{ opacity: 0, y: 20 }}
          to={{ opacity: 1, y: 0 }}
          className="mt-14"
        >
          <p className="max-w-3xl font-body text-body-lg leading-relaxed text-[var(--ink)]">
            {storyText}
          </p>
        </Inview>

        {/* Full-width cinematic photo — caption below, not glass-on-image */}
        <Inview
          delayIn={150}
          stiffness={180}
          damping={26}
          from={{ opacity: 0, y: 36 }}
          to={{ opacity: 1, y: 0 }}
          className="mt-16"
        >
          <figure>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-card-lg sm:aspect-[21/9]">
              <Parallax>
                <Image
                  src={imageUrl}
                  alt="Inside the Haram Textile knitting and dyeing facility in Faisalabad"
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              </Parallax>
            </div>
            <figcaption className="mt-4 flex items-baseline justify-between gap-6 font-body text-caption text-[var(--ink-soft)]">
              <span>Knitting &amp; dyeing floor — West Millat Industrial Estate, Faisalabad</span>
              <span className="shrink-0 uppercase tracking-[0.14em]">Since 2009</span>
            </figcaption>
          </figure>
        </Inview>
      </div>
    </section>
  );
}
