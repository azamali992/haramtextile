import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/sections/SectionHeader";

export interface ProductShowcaseItem {
  id: string;
  name: string;
  categoryName: string;
  fabricType?: string | null;
  moq?: string | null;
  image: { src: string; width: number; height: number };
}

interface ProductShowcaseGridProps {
  eyebrow?: string;
  title: string[];
  body?: string;
  items: ProductShowcaseItem[];
  viewAllHref?: string;
  className?: string;
}

/**
 * Flat editorial product grid — plain photo, caption below (category —
 * fabric/MOQ tag), product name. Replaces the 3D cylinder carousel with a
 * static 3-column grid; each card links to its catalog detail page.
 */
export function ProductShowcaseGrid({
  eyebrow,
  title,
  body,
  items,
  viewAllHref = "/catalog",
  className = "",
}: ProductShowcaseGridProps) {
  if (items.length === 0) return null;

  return (
    <section className={`bg-[var(--background)] px-6 py-24 sm:px-10 ${className}`}>
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            body={body}
            titleClassName="text-display text-[var(--ink)]"
            bodyClassName="max-w-xl text-[var(--ink-soft)]"
          />
          <Link
            href={viewAllHref}
            className="hidden shrink-0 items-center gap-2 border-b border-[var(--brand)] pb-1 font-body text-sm font-medium uppercase tracking-wide text-[var(--ink)] transition-colors duration-150 hover:text-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] sm:inline-flex"
          >
            View catalog
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <Link key={product.id} href={`/catalog/${product.id}`} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-[var(--surface)]">
                <Image
                  src={product.image.src}
                  alt={`${product.name}, ${product.categoryName} apparel by Haram Textile`}
                  width={product.image.width}
                  height={product.image.height}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-5 flex items-center gap-2 font-body text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                <span>{product.categoryName}</span>
                {(product.fabricType || product.moq) && (
                  <>
                    <span aria-hidden="true">&mdash;</span>
                    <span>{product.fabricType ?? `MOQ ${product.moq}`}</span>
                  </>
                )}
              </div>
              <h3 className="mt-2 font-heading text-title-sm font-normal text-[var(--ink)]">
                {product.name}
              </h3>
            </Link>
          ))}
        </div>

        <div className="mt-14 flex justify-center sm:hidden">
          <Link
            href={viewAllHref}
            className="font-body text-sm font-medium uppercase tracking-wide text-[var(--ink)] underline decoration-[var(--brand)] underline-offset-4"
          >
            View full catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
