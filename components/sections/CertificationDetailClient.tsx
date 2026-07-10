"use client";

import Image from "next/image";
import Link from "next/link";
import { RevealText } from "@/components/motion/RevealText";
import { Inview } from "@/components/motion/Inview";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PillButton } from "@/components/ui/PillButton";
import { useUI } from "@/components/layout/UIProvider";

interface CertificationData {
  id: string;
  name: string;
  issuingBody: string | null;
  description: string | null;
  image: { src: string; width: number; height: number };
  siteName: string;
}

interface CertificationDetailClientProps {
  certification: CertificationData;
}

/**
 * Client component for the certification detail page visual + motion layer.
 *
 * Implements:
 * - RevealText (clip-mask) for the certification name (h1)
 * - Inview rise-ins for badge image, issuingBody, description
 * - PillButton CTA to open the contact modal
 * - Link back to certifications overview
 */
export function CertificationDetailClient({ certification }: CertificationDetailClientProps) {
  const { openContact } = useUI();

  return (
    <article className="px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start">
          {/* Left: Badge + context text */}
          <div>
            {/* Badge image — Inview scale reveal */}
            <Inview
              delayIn={0}
              stiffness={220}
              damping={22}
              from={{ opacity: 0, scale: 0.88 }}
              to={{ opacity: 1, scale: 1 }}
            >
              <div className="flex h-32 items-center">
                <Image
                  src={certification.image.src}
                  alt={`${certification.name} certification badge`}
                  width={certification.image.width}
                  height={certification.image.height}
                  priority
                  className="h-28 w-auto object-contain"
                />
              </div>
            </Inview>

            {/* Eyebrow */}
            <Inview
              delayIn={80}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 16 }}
              to={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Eyebrow tone="dark">Quality certification</Eyebrow>
            </Inview>

            {/* h1 — clip-mask RevealText */}
            <RevealText
              as="h1"
              stagger={80}
              duration={0.95}
              className="mt-4 font-heading font-normal text-[2.5rem] leading-[0.98] tracking-tight text-[var(--ink)] sm:text-display"
            >
              {certification.name}
            </RevealText>

            {/* Issuing body */}
            {certification.issuingBody && (
              <Inview
                delayIn={160}
                stiffness={190}
                damping={26}
                from={{ opacity: 0, y: 16 }}
                to={{ opacity: 1, y: 0 }}
              >
                <p className="mt-3 font-body text-base font-medium text-[var(--brand-strong)]">
                  Issued by {certification.issuingBody}
                </p>
              </Inview>
            )}

            {/* Description */}
            {certification.description && (
              <Inview
                delayIn={220}
                stiffness={190}
                damping={26}
                from={{ opacity: 0, y: 16 }}
                to={{ opacity: 1, y: 0 }}
              >
                <p className="mt-6 font-body text-base leading-relaxed text-[var(--ink-soft)]">
                  {certification.description}
                </p>
              </Inview>
            )}

            {/* Overview link */}
            <Inview
              delayIn={280}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 16 }}
              to={{ opacity: 1, y: 0 }}
            >
              <p className="mt-6 font-body text-base text-[var(--ink-soft)]">
                This certification forms part of {certification.siteName}&rsquo;s broader quality
                and compliance program. See our full{" "}
                <Link
                  href="/certifications"
                  className="text-[var(--brand-strong)] underline underline-offset-4 transition-colors hover:text-[var(--brand-deep)]"
                >
                  certifications overview
                </Link>{" "}
                for the complete list.
              </p>
            </Inview>
          </div>

          {/* Right: Info card */}
          <Inview
            delayIn={100}
            stiffness={180}
            damping={26}
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
          >
            <div className="rounded-card-lg bg-brand-deep p-8 text-[var(--on-brand)]">
              <span
                className="block h-2 w-2 rounded-full bg-[var(--brand-light)]"
                aria-hidden="true"
              />
              <h2 className="mt-6 font-heading text-title font-normal leading-tight tracking-tight">
                {certification.name}
              </h2>
              {certification.issuingBody && (
                <p className="mt-2 font-body text-sm text-on-brand/80">
                  {certification.issuingBody}
                </p>
              )}
              <div className="mt-8 border-t border-on-brand/15 pt-8">
                <p className="font-body text-sm leading-relaxed text-on-brand/85">
                  {certification.siteName} maintains this certification as part of our
                  commitment to quality, social compliance, and international manufacturing
                  standards. Contact our team for audit reports or further documentation.
                </p>
              </div>
              <div className="mt-8">
                <PillButton variant="light" onClick={openContact}>
                  Request Documentation
                </PillButton>
              </div>
            </div>
          </Inview>
        </div>
      </div>
    </article>
  );
}
