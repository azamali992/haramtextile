"use client";

import Image from "next/image";
import Link from "next/link";
import { HorizontalScroller } from "@/components/ui/HorizontalScroller";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Inview } from "@/components/motion/Inview";

export interface ProductShowcaseSlide {
  /** Zero-padded display index, e.g. "01". */
  index: string;
  /** Category slug — card links to `/products?category={slug}`. */
  slug: string;
  /** Category display name. */
  name: string;
  /** Short category intro shown under the name. */
  intro: string;
  /** Cover image. */
  image: { src: string; width: number; height: number };
}

interface ProductShowcaseCarouselProps {
  /** Optional eyebrow above the section title. */
  eyebrow?: string;
  /** Section title lines. */
  title: string[];
  /** Body copy next to the title. */
  body?: string;
  slides: ProductShowcaseSlide[];
  className?: string;
}

/**
 * Home signature section #1 — an edge-bleeding horizontal carousel of
 * portrait product-category cards: full-bleed photo, bottom scrim, index
 * numeral, Playfair name, and a hover arrow. Cards link to the filtered
 * products page.
 */
export function ProductShowcaseCarousel({
  eyebrow,
  title,
  body,
  slides,
  className = "",
}: ProductShowcaseCarouselProps) {
  if (slides.length === 0) return null;

  return (
    <div className={`bg-[var(--background)] py-24 sm:py-32 ${className}`}>
      <HorizontalScroller
        ariaLabel="Product collections"
        header={
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            body={body}
            titleClassName="text-display text-[var(--ink)]"
            bodyClassName="max-w-xl text-[var(--ink-soft)]"
          />
        }
      >
        {slides.map((slide, i) => (
          <div key={slide.slug} className="w-[78vw] shrink-0 snap-start sm:w-[30rem]">
            <Inview
              delayIn={Math.min(i, 3) * 90}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 32 }}
              to={{ opacity: 1, y: 0 }}
            >
              <Link
                href={`/products?category=${slide.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
                draggable={false}
              >
                <Image
                  src={slide.image.src}
                  alt={`${slide.name} — Haram Textile collection`}
                  fill
                  sizes="(max-width: 640px) 78vw, 30rem"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading={i < 2 ? "eager" : "lazy"}
                  draggable={false}
                />
                {/* Single bottom scrim — one layer, no card-in-card */}
                <div
                  className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-scrim/85 via-scrim/35 to-transparent"
                  aria-hidden="true"
                />

                {/* Ghost index numeral — oversized, intensifies on hover */}
                <span className="pointer-events-none absolute right-4 top-1 select-none font-heading text-[4rem] leading-none tabular-nums text-on-brand/10 transition-colors duration-300 group-hover:text-on-brand/25">
                  {slide.index}
                </span>

                {/* Name + intro + hover arrow */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                  <div className="min-w-0 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                    <h3 className="font-heading text-title font-normal text-[var(--on-brand)]">
                      {slide.name}
                    </h3>
                    {slide.intro && (
                      <p className="mt-2 line-clamp-2 font-body text-caption text-on-brand/85">
                        {slide.intro}
                      </p>
                    )}
                  </div>
                  <span
                    className="grid size-14 shrink-0 translate-y-2 place-items-center rounded-pill border border-on-brand/50 bg-on-brand/10 text-[var(--on-brand)] opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:bg-on-brand/20 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                    aria-hidden="true"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            </Inview>
          </div>
        ))}
      </HorizontalScroller>
    </div>
  );
}
