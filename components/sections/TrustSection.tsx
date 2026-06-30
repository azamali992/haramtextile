"use client";

import Image from "next/image";
import Link from "next/link";
import { Inview } from "@/components/motion/Inview";
import { RevealText } from "@/components/motion/RevealText";

interface ClientLogoData {
  id: string;
  imageUrl: string;
  altText: string;
}

interface CertificationData {
  id: string;
  name: string;
  issuingBody?: string | null;
  imageUrl?: string;
}

interface TrustSectionProps {
  clientLogos: ClientLogoData[];
  certifications: CertificationData[];
}

/**
 * Reference "Trust / social proof" section.
 *
 * Renders:
 * - An oversized ghost headline "Trusted By Global Brands" with the word
 *   "Global" highlighted in gold, using RevealText.
 * - A CSS marquee of client logos (auto-scrolling, pauses on hover).
 * - Certification badges rendered as small pill-style trust chips.
 *
 * Uses the existing `.logo-marquee-viewport` / `.logo-marquee-track` CSS
 * animations from globals.css (defined in Phase 2).
 */
export function TrustSection({
  clientLogos,
  certifications,
}: TrustSectionProps) {
  if (clientLogos.length === 0 && certifications.length === 0) return null;

  // Double the logo list for seamless marquee loop
  const marqueeLogos = [...clientLogos, ...clientLogos];

  return (
    <section
      className="relative isolate overflow-hidden bg-[var(--background)] px-6 py-20 sm:px-10 sm:py-24"
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-[90rem]">
        {/* Top row — badge + heading intro */}
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Inview
            from={{ opacity: 0, scale: 0.9 }}
            to={{ opacity: 1, scale: 1 }}
            stiffness={220}
            damping={22}
          >
            <div className="grid size-28 place-items-center rounded-full bg-[var(--surface)] text-center sm:size-32">
              <div>
                <p className="font-heading text-2xl font-medium text-[var(--ink)]">
                  15+
                </p>
                <p
                  className="mx-auto mt-1 max-w-[7em] font-body text-[0.6rem] leading-snug text-[var(--ink-soft)]"
                >
                  Years serving global brands
                </p>
              </div>
            </div>
          </Inview>

          <Inview
            delayIn={120}
            stiffness={200}
            damping={26}
            from={{ opacity: 0, y: 24 }}
            to={{ opacity: 1, y: 0 }}
            className="max-w-md"
          >
            <article className="rounded-[var(--radius-card)] bg-[var(--surface)] p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <span className="rounded-xl bg-[var(--background)] px-4 py-2 font-heading text-xl font-medium text-[var(--ink)]">
                  #01
                </span>
                <p className="font-heading text-lg font-medium text-[var(--ink)]">
                  Trusted by global brands
                </p>
              </div>
              <p className="mt-3 font-body text-xs leading-relaxed text-[var(--ink-soft)]">
                From European retailers to American sportswear labels, Haram
                Textile delivers consistent quality at scale — meeting the
                standards of the world&apos;s most demanding buyers.
              </p>
            </article>
          </Inview>
        </div>

        {/* Oversized ghost headline */}
        <div
          className="pointer-events-none relative z-0 mt-12 max-w-[88rem] select-none"
          id="trust-heading"
          aria-label="Trusted By Global Brands"
        >
          <div className="flex justify-between overflow-hidden pb-[0.12em]">
            <RevealText
              as="span"
              stagger={60}
              duration={0.7}
              className="font-heading font-medium uppercase leading-[1.02] tracking-tight text-[var(--ghost)]"
              motionProps={{ style: { fontSize: "clamp(2rem, 8.2vw, 10rem)" } }}
            >
              Trusted By
            </RevealText>
          </div>
          <div className="flex justify-between overflow-hidden pb-[0.12em]">
            {/* "Global" in brand gold */}
            <RevealText
              as="span"
              stagger={60}
              duration={0.7}
              className="font-heading font-medium uppercase leading-[1.02] tracking-tight text-[var(--ink)]"
              motionProps={{ style: { fontSize: "clamp(2rem, 8.2vw, 10rem)" } }}
            >
              Global
            </RevealText>
            <RevealText
              as="span"
              stagger={60}
              duration={0.7}
              className="font-heading font-medium uppercase leading-[1.02] tracking-tight text-[var(--ghost)]"
              motionProps={{ style: { fontSize: "clamp(2rem, 8.2vw, 10rem)" } }}
            >
              Brands
            </RevealText>
          </div>
        </div>

        {/* Client logo marquee */}
        {clientLogos.length > 0 && (
          <div className="logo-marquee-viewport mt-12" aria-label="Client logos">
            <div className="logo-marquee-track">
              {marqueeLogos.map((logo, i) => (
                <div
                  key={`${logo.id}-${i}`}
                  className="relative h-10 w-28 shrink-0 sm:h-12 sm:w-36"
                >
                  <Image
                    src={logo.imageUrl}
                    alt={logo.altText}
                    fill
                    sizes="144px"
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certification badges */}
        {certifications.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-3">
            {certifications.map((cert, i) => (
              <Inview
                key={cert.id}
                delayIn={i * 80}
                stiffness={200}
                damping={26}
                from={{ opacity: 0, y: 16 }}
                to={{ opacity: 1, y: 0 }}
              >
                <Link
                  href={`/certifications/${cert.id}`}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--hairline)] bg-[var(--surface)] px-4 py-2 font-body text-xs font-medium text-[var(--ink)] transition-colors duration-150 hover:border-[var(--brand)] hover:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand)]"
                    aria-hidden="true"
                  />
                  {cert.name}
                </Link>
              </Inview>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
