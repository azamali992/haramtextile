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

const FOUNDED_YEAR = 2009;

/**
 * Trust / social proof: an oversized ghost editorial headline ("Trusted by
 * global brands" - "global" in italic ink), a computed years-of-operation
 * stat line, the client logo marquee, and certification chips.
 */
export function TrustSection({
  clientLogos,
  certifications,
}: TrustSectionProps) {
  if (clientLogos.length === 0 && certifications.length === 0) return null;

  const yearsOperating = new Date().getFullYear() - FOUNDED_YEAR;

  // With enough logos, split into two opposing rows; otherwise keep a single
  // row. Each row is doubled so the -50% keyframe loops seamlessly.
  const twoRows = clientLogos.length >= 6;
  const splitAt = Math.ceil(clientLogos.length / 2);
  const rowOne = twoRows ? clientLogos.slice(0, splitAt) : clientLogos;
  const rowTwo = twoRows ? clientLogos.slice(splitAt) : [];
  const loop = (logos: ClientLogoData[]) => [...logos, ...logos];

  const ghostStyle = { fontSize: "clamp(2.5rem, 8.2vw, 10rem)" };

  return (
    <section
      className="relative isolate overflow-hidden bg-[var(--background)] px-6 py-24 sm:px-10 sm:py-32"
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-[90rem]">
        {/* Oversized ghost headline */}
        <div
          className="pointer-events-none relative z-0 select-none"
          id="trust-heading"
          aria-label="Trusted by global brands"
        >
          <div className="overflow-hidden pb-[0.12em]">
            <RevealText
              as="span"
              stagger={60}
              duration={0.7}
              className="font-heading font-normal leading-[1.02] tracking-tight text-[var(--ghost)]"
              motionProps={{ style: ghostStyle }}
            >
              Trusted by
            </RevealText>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-[0.28em] overflow-hidden pb-[0.12em]">
            <RevealText
              as="span"
              stagger={60}
              duration={0.7}
              className="font-heading font-normal italic leading-[1.02] tracking-tight text-[var(--ink)]"
              motionProps={{ style: ghostStyle }}
            >
              global
            </RevealText>
            <RevealText
              as="span"
              stagger={60}
              duration={0.7}
              className="font-heading font-normal leading-[1.02] tracking-tight text-[var(--ghost)]"
              motionProps={{ style: ghostStyle }}
            >
              brands
            </RevealText>
          </div>
        </div>

        {/* Computed stat line */}
        <Inview
          delayIn={150}
          stiffness={200}
          damping={26}
          from={{ opacity: 0, y: 16 }}
          to={{ opacity: 1, y: 0 }}
        >
          <p className="mt-10 max-w-md border-t border-[var(--hairline)] pt-5 font-body text-caption text-[var(--ink-soft)]">
            <span className="font-heading text-title-sm italic text-[var(--ink)]">
              {yearsOperating}+ years
            </span>{" "}
            manufacturing for European and American labels - consistent quality
            at scale from Faisalabad, Pakistan.
          </p>
        </Inview>

        {/* Client logo marquee - single row, or two opposing rows when there
            are enough logos to fill both. */}
        {clientLogos.length > 0 && (
          <div className="logo-marquee-viewport mt-14" aria-label="Client logos">
            {[rowOne, ...(twoRows && rowTwo.length > 0 ? [rowTwo] : [])].map(
              (row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`logo-marquee-track ${rowIndex === 1 ? "logo-marquee-track-reverse mt-6" : ""}`}
                >
                  {loop(row).map((logo, i) => (
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
              ),
            )}
          </div>
        )}

        {/* Certification badges */}
        {certifications.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-3">
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
                  className="inline-flex items-center gap-2 rounded-pill border border-[var(--hairline)] bg-[var(--surface)] px-4 py-2 font-body text-xs font-medium text-[var(--ink)] transition-colors duration-150 hover:border-[var(--brand)] hover:text-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
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
