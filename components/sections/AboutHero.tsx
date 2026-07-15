"use client";

import Image from "next/image";
import { Inview } from "@/components/motion/Inview";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PillButton } from "@/components/ui/PillButton";
import { RevealLines } from "@/components/motion/RevealLines";
import { Parallax } from "@/components/motion/Parallax";
import { PhotoHero } from "@/components/sections/PhotoHero";

interface AboutHeroProps {
  /** Admin-editable story text (AboutContent.storyText). */
  storyText: string;
  /** Admin-editable story image URL (AboutContent.imageUrl with fallback applied). */
  imageUrl: string;
}

/**
 * About page opener — a photo hero band (matching the Production page's
 * chapter-opener treatment) followed by a two-column story: the
 * admin-editable narrative and a CTA on the left, a parallax factory photo
 * on the right.
 */
export function AboutHero({ storyText, imageUrl }: AboutHeroProps) {
  return (
    <>
      <div className="px-2 sm:px-3">
        <PhotoHero
          eyebrow="Est. 2009 &middot; Faisalabad, Pakistan"
          title="About Haram Textile"
          subtitle="A trusted apparel manufacturer supplying international brands and retailers from Faisalabad, Pakistan."
          imageSrc="/images/hero/hero-factory.jpg"
          imageAlt="Haram Textile's garment manufacturing facility in Faisalabad, Pakistan"
          as="h1"
        />
      </div>

      <section
        className="bg-[var(--background)] px-6 py-24 sm:px-10 sm:py-32"
        aria-labelledby="about-story-heading"
      >
        <div className="mx-auto grid max-w-[90rem] grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Story */}
          <div>
            <Eyebrow tone="dark">Our story</Eyebrow>
            <h2 id="about-story-heading" className="sr-only">
              Our Story
            </h2>
            <RevealLines
              lines={["A complete setup", "under one roof"]}
              stagger={120}
              duration={0.95}
              className="mt-4 font-heading font-normal text-display leading-[0.98] tracking-tight text-[var(--ink)]"
            />
            <Inview
              delayIn={120}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
            >
              <p className="mt-7 max-w-xl font-body text-body-lg leading-relaxed text-[var(--ink)]">
                {storyText}
              </p>
              <div className="mt-9">
                <PillButton variant="solid" href="/production">
                  See our process
                </PillButton>
              </div>
            </Inview>
          </div>

          {/* Photo */}
          <Inview
            delayIn={150}
            stiffness={180}
            damping={26}
            from={{ opacity: 0, y: 36 }}
            to={{ opacity: 1, y: 0 }}
          >
            <figure>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card-lg">
                <Parallax>
                  <Image
                    src={imageUrl}
                    alt="Inside the Haram Textile knitting and dyeing facility in Faisalabad"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </Parallax>
              </div>
              <figcaption className="mt-4 flex items-baseline justify-between gap-6 font-body text-caption text-[var(--ink-soft)]">
                <span>Knitting &amp; dyeing floor — West Millat Industrial Estate</span>
                <span className="shrink-0 uppercase tracking-[0.14em]">Since 2009</span>
              </figcaption>
            </figure>
          </Inview>
        </div>
      </section>
    </>
  );
}
