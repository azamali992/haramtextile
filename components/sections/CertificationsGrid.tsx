"use client";

import { Inview } from "@/components/motion/Inview";
import { HoverSpring } from "@/components/motion/HoverSpring";
import { CertificationCard, type CertificationCardData } from "@/components/ui/Card";

interface CertificationsGridProps {
  certifications: CertificationCardData[];
}

/**
 * Motion-wrapped certifications card grid. Each CertificationCard gets an
 * Inview rise-in (stagger i × 80ms) plus a subtle hover lift (HoverSpring).
 *
 * Client component - data resolved server-side in the page.
 */
export function CertificationsGrid({ certifications }: CertificationsGridProps) {
  const MAX_STAGGER_MS = 480;

  return (
    <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {certifications.map((cert, index) => (
        <Inview
          key={cert.id}
          delayIn={Math.min(index * 80, MAX_STAGGER_MS)}
          stiffness={190}
          damping={26}
          from={{ opacity: 0, y: 30 }}
          to={{ opacity: 1, y: 0 }}
          className="h-full"
        >
          <HoverSpring to={{ y: -6 }} stiffness={300} damping={22} className="block h-full">
            <CertificationCard certification={cert} />
          </HoverSpring>
        </Inview>
      ))}
    </div>
  );
}
