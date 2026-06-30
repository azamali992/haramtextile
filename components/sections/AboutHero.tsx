"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { RevealText } from "@/components/motion/RevealText";
import { Inview } from "@/components/motion/Inview";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { useScrollParallax } from "@/components/motion/useScrollParallax";

interface AboutHeroProps {
  /** Admin-editable story text (AboutContent.storyText). */
  storyText: string;
  /** Admin-editable hero image URL (AboutContent.imageUrl with fallback applied). */
  imageUrl: string;
  /** Admin-editable mission text (AboutContent.missionText). */
  missionText: string | null;
}

/**
 * About page hero — editorial dark-green section with clip-mask word reveal
 * for the h1, a stacked-line body reveal, and a parallax factory photo.
 *
 * The missionText is shown below as an Inview card when the admin has set it.
 */
export function AboutHero({ storyText, imageUrl, missionText }: AboutHeroProps) {
  const { ref: parallaxRef, value: parallaxY } = useScrollParallax<HTMLDivElement>({
    outputRange: ["0%", "12%"],
  });

  return (
    <section
      className="relative isolate overflow-hidden rounded-[var(--radius-card-lg)] bg-[var(--brand-deep)] px-6 py-20 text-[var(--on-brand)] sm:px-10 sm:py-28"
      aria-label="About Haram Textile"
    >
      {/* Parallax background image */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[var(--radius-card-lg)]">
        <motion.div
          ref={parallaxRef}
          style={{ y: parallaxY }}
          className="absolute left-0 right-0 top-[-16%] h-[132%] w-full"
        >
          <Image
            src={imageUrl}
            alt="Inside the Haram Textile knitting and dyeing facility in Faisalabad"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
        </motion.div>
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(30,58,15,0.85), rgba(30,58,15,0.6), rgba(30,58,15,0.9))",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[90rem]">
        {/* Eyebrow */}
        <Eyebrow tone="light">Est. 2009</Eyebrow>

        {/* h1 — word-by-word reveal */}
        <RevealText
          as="h1"
          stagger={120}
          duration={1.1}
          className="mt-4 font-heading text-[3rem] leading-[0.92] tracking-tight text-[var(--on-brand)] sm:text-[4rem] lg:text-[5rem]"
        >
          About Haram Textile
        </RevealText>

        {/* Two-column layout: body text + tilted image */}
        <div className="mt-16 grid grid-cols-1 items-end gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Left: story text */}
          <div className="lg:col-span-3">
            <Inview
              delayIn={100}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
            >
              <p className="font-body text-base leading-relaxed text-[rgba(253,250,246,0.8)] sm:text-lg">
                {storyText}
              </p>
            </Inview>

            {/* Admin-editable missionText */}
            {missionText && (
              <Inview
                delayIn={300}
                stiffness={180}
                damping={26}
                from={{ opacity: 0, y: 24 }}
                to={{ opacity: 1, y: 0 }}
              >
                <div className="mt-8 rounded-[var(--radius-card)] border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                  <p className="font-body text-sm leading-relaxed text-[rgba(253,250,246,0.85)]">
                    {missionText}
                  </p>
                </div>
              </Inview>
            )}
          </div>

          {/* Right: tilted factory image card */}
          <Inview
            delayIn={200}
            stiffness={180}
            damping={26}
            from={{ opacity: 0, y: 48 }}
            to={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <motion.figure
              className="relative aspect-[3/4] w-full max-w-xs overflow-hidden rounded-[var(--radius-card)] bg-[var(--surface)] md:mx-auto"
              style={{ rotate: "3deg" }}
              whileHover={{ rotate: "0deg", scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <Image
                src={imageUrl}
                alt="Inside the Haram Textile factory in Faisalabad"
                fill
                sizes="(max-width: 768px) 80vw, 30vw"
                className="object-cover"
                loading="lazy"
              />
              <figcaption className="absolute inset-x-3 bottom-3 rounded-[var(--radius-card)] bg-[var(--brand-deep)]/60 p-3 backdrop-blur-sm">
                <p className="font-body text-sm font-medium text-[var(--on-brand)]">
                  Faisalabad, Pakistan
                </p>
                <p className="mt-0.5 font-body text-[0.65rem] leading-snug text-[rgba(253,250,246,0.8)]">
                  West Millat Industrial Estate
                </p>
              </figcaption>
            </motion.figure>
          </Inview>
        </div>
      </div>
    </section>
  );
}
