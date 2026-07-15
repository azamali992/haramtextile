import { SectionHeader } from "@/components/sections/SectionHeader";
import { CylinderCarousel, type CylinderCarouselItem } from "@/components/ui/cylinder-carousel";

interface ProductCylinderShowcaseProps {
  eyebrow?: string;
  title: string[];
  body?: string;
  items: CylinderCarouselItem[];
  className?: string;
}

/**
 * Home signature section — a 3D rotating cylinder of real product photos
 * (drag to spin, auto-rotates, each face links to its catalog detail page).
 * Reduced motion falls back to a static horizontal scroll row (same faces).
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
    <section className={`overflow-hidden bg-[var(--background)] py-24 sm:py-32 ${className}`}>
      <div className="mx-auto max-w-[90rem] px-6 sm:px-10">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          body={body}
          titleClassName="text-display text-[var(--ink)]"
          bodyClassName="max-w-xl text-[var(--ink-soft)]"
        />
      </div>

      <div className="mt-16">
        <CylinderCarousel images={items} />
      </div>
    </section>
  );
}
