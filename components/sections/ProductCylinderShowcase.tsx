import { SectionHeader } from "@/components/sections/SectionHeader";
import { PillButton } from "@/components/ui/PillButton";
import { CylinderCarousel, type CylinderCarouselItem } from "@/components/ui/cylinder-carousel";

interface ProductCylinderShowcaseProps {
  eyebrow?: string;
  title: string[];
  body?: string;
  items: CylinderCarouselItem[];
  className?: string;
}

/**
 * Home signature section - a full-bleed 3D rotating cylinder of real product
 * photos (drag to spin, auto-rotates, each face links to its catalog detail
 * page). Breaks out of the page's px-2/px-3 inset via negative margins so
 * the carousel spans the true viewport edge. Reduced motion falls back to a
 * static horizontal scroll row (same faces).
 */
export function ProductCylinderShowcase({
  eyebrow,
  title,
  body,
  items,
  className = "",
}: ProductCylinderShowcaseProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={`-mx-2 overflow-hidden bg-[var(--background)] py-24 sm:-mx-3 sm:py-32 ${className}`}
    >
      <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-8 px-6 sm:flex-row sm:items-end sm:px-10">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          body={body}
          titleClassName="text-display text-[var(--ink)]"
          bodyClassName="max-w-xl text-[var(--ink-soft)]"
        />
        <PillButton variant="outline" href="/catalog" className="shrink-0">
          View full catalog
        </PillButton>
      </div>

      <div className="mt-24 sm:mt-32">
        <CylinderCarousel images={items} radius={620} faceWidth={260} perspective={2000} />
      </div>
    </section>
  );
}
