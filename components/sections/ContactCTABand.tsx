"use client";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealLines } from "@/components/motion/RevealLines";
import { Inview } from "@/components/motion/Inview";
import { PillButton } from "@/components/ui/PillButton";
import { useUI } from "@/components/layout/UIProvider";

interface ContactCTABandProps {
  /** Optional eyebrow kicker. @default "Get started" */
  eyebrow?: string;
  /** Stacked headline lines. @default ["Ready to", "start your order?"] */
  title?: string[];
  /** CTA button label. @default "Get a Quote" */
  ctaLabel?: string;
  /** Extra classes on the outer section. */
  className?: string;
}

/**
 * Deep-green CTA band that mirrors the reference footer CTA pattern.
 * The pill button opens the contact modal via `useUI().openContact()`.
 *
 * Used at the bottom of the Home page above the FAQ. Reusable on any
 * page that needs a strong conversion call-to-action.
 */
export function ContactCTABand({
  eyebrow = "Get started",
  title = ["Ready to", "start your order?"],
  ctaLabel = "Get a Quote",
  className = "",
}: ContactCTABandProps) {
  const { openContact } = useUI();

  return (
    <section
      className={`mt-3 rounded-[var(--radius-card-lg)] bg-[var(--brand-deep)] px-6 py-20 sm:px-10 sm:py-24 ${className}`}
      aria-label="Contact call to action"
    >
      <div className="mx-auto flex max-w-[90rem] flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
        {/* Left — headline */}
        <div>
          <Eyebrow tone="light">{eyebrow}</Eyebrow>
          <RevealLines
            lines={title}
            stagger={110}
            duration={0.9}
            className="mt-4 font-heading text-[3.75rem] leading-[0.92] tracking-tight text-[var(--on-brand)]"
          />
        </div>

        {/* Right — CTA pill */}
        <Inview
          delayIn={150}
          stiffness={200}
          damping={24}
          from={{ opacity: 0, y: 20 }}
          to={{ opacity: 1, y: 0 }}
          className="shrink-0"
        >
          <PillButton variant="light" onClick={openContact}>
            {ctaLabel}
          </PillButton>
        </Inview>
      </div>
    </section>
  );
}
