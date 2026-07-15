import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealLines } from "@/components/motion/RevealLines";
import { PillButton } from "@/components/ui/PillButton";
import {
  VerticalCylinderCarousel,
  type VerticalCylinderItem,
} from "@/components/ui/vertical-cylinder-carousel";

interface ProcessShowcaseProps {
  eyebrow?: string;
  title: string[];
  body: string;
  images: VerticalCylinderItem[];
  ctaHref?: string;
  ctaText?: string;
  className?: string;
}

/**
 * Two-column process section: description + CTA on the left, a vertical
 * rotating cylinder of real factory photos (one per manufacturing stage) on
 * the right. Sits as the last content section on Home, directly above the
 * footer.
 */
export function ProcessShowcase({
  eyebrow,
  title,
  body,
  images,
  ctaHref = "/production",
  ctaText = "See the full process",
  className = "",
}: ProcessShowcaseProps) {
  if (images.length === 0) return null;

  return (
    <section className={`bg-[var(--surface)] px-6 py-24 sm:px-10 sm:py-32 ${className}`}>
      <div className="mx-auto grid max-w-[90rem] grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div>
          {eyebrow && <Eyebrow tone="dark">{eyebrow}</Eyebrow>}
          <RevealLines
            lines={title}
            stagger={120}
            duration={0.95}
            className="mt-4 font-heading font-normal text-display text-[var(--ink)]"
          />
          <p className="mt-6 max-w-xl font-body text-body leading-relaxed text-[var(--ink-soft)]">
            {body}
          </p>
          <div className="mt-9">
            <PillButton variant="solid" href={ctaHref}>
              {ctaText}
            </PillButton>
          </div>
        </div>

        <VerticalCylinderCarousel images={images} className="mx-auto" />
      </div>
    </section>
  );
}
