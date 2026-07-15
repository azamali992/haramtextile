"use client";

import Image from "next/image";
import { RevealText } from "@/components/motion/RevealText";
import { Inview } from "@/components/motion/Inview";
import { HoverSpring } from "@/components/motion/HoverSpring";
import { TiltCard } from "@/components/motion/TiltCard";
import { Badge } from "@/components/ui/Badge";
import { PillButton } from "@/components/ui/PillButton";
import { useUI } from "@/components/layout/UIProvider";
import type { FallbackImage } from "@/lib/product-image-fallback";

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  fabricType: string | null;
  moq: string | null;
  tags: string[];
  categoryName: string;
  coverImage: { src: string; width: number; height: number };
  gallery: FallbackImage[];
}

interface ProductDetailClientProps {
  product: ProductData;
}

/**
 * Client component rendering the product detail page visual + motion layer.
 * All data is fetched server-side in the page and passed as props.
 *
 * Implements the reference card/gallery motion patterns on real product fields:
 * - Clip-mask RevealText for product.name (h1)
 * - Glass/tilted hover on the main product image
 * - Inview rise-ins for the spec list (fabricType, moq, tags)
 * - Motion gallery grid (Inview + HoverSpring scale) for the fallback gallery
 * - PillButton "Request a Quote" that opens the contact modal
 */
export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { openContact } = useUI();

  return (
    <article className="px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-[90rem]">
        {/* ── Product hero layout ── */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
          {/* Cover image - glassy/tilted hover */}
          <Inview
            delayIn={0}
            stiffness={180}
            damping={26}
            from={{ opacity: 0, y: 48 }}
            to={{ opacity: 1, y: 0 }}
          >
            <figure>
              <TiltCard
                maxTilt={7}
                className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-[var(--surface)]"
              >
                <Image
                  src={product.coverImage.src}
                  alt={`${product.name}, ${product.categoryName} apparel by Haram Textile`}
                  width={product.coverImage.width}
                  height={product.coverImage.height}
                  priority
                  className="h-full w-full object-cover"
                />
              </TiltCard>
              <figcaption className="mt-3 font-body text-caption text-[var(--ink-soft)]">
                {product.categoryName} - Haram Textile, Faisalabad
              </figcaption>
            </figure>
          </Inview>

          {/* Product info */}
          <div>
            <Inview
              delayIn={60}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
            >
              <Badge variant="category">{product.categoryName}</Badge>
            </Inview>

            {/* Clip-mask RevealText for product name (h1). RevealText renders
                inline, so the gap below the category badge lives on this
                wrapper (margin-top is ignored on inline elements). */}
            <div className="mt-7">
              <RevealText
                as="h1"
                stagger={80}
                duration={0.95}
                className="font-heading font-normal text-[2.5rem] leading-[0.98] tracking-tight text-[var(--ink)] sm:text-display"
              >
                {product.name}
              </RevealText>
            </div>

            {/* Description */}
            {product.description && (
              <Inview
                delayIn={120}
                stiffness={190}
                damping={26}
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
              >
                <p className="mt-6 font-body text-base leading-relaxed text-[var(--ink-soft)]">
                  {product.description}
                </p>
              </Inview>
            )}

            {/* Specs - rise-in list */}
            {(product.fabricType || product.moq) && (
              <Inview
                delayIn={180}
                stiffness={190}
                damping={26}
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
              >
                <dl className="mt-8 space-y-4 border-t border-[var(--hairline)] pt-6">
                  {product.fabricType && (
                    <div>
                      <dt className="font-body text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">
                        Fabric Type
                      </dt>
                      <dd className="mt-1 font-body text-base text-[var(--ink)]">
                        {product.fabricType}
                      </dd>
                    </div>
                  )}
                  {product.moq && (
                    <div>
                      <dt className="font-body text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">
                        Minimum Order Quantity
                      </dt>
                      <dd className="mt-2">
                        <Badge variant="moq">{product.moq}</Badge>
                      </dd>
                    </div>
                  )}
                </dl>
              </Inview>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <Inview
                delayIn={240}
                stiffness={190}
                damping={26}
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
              >
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Product tags">
                  {product.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-[var(--radius-pill)] border border-[var(--hairline)] px-4 py-1.5 font-body text-xs text-[var(--ink-soft)]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </Inview>
            )}

            {/* CTA */}
            <Inview
              delayIn={300}
              stiffness={200}
              damping={24}
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
            >
              <div className="mt-10">
                <PillButton variant="solid" onClick={openContact}>
                  Request a Quote
                </PillButton>
              </div>
            </Inview>
          </div>
        </div>

        {/* ── Fallback gallery ── */}
        {product.gallery.length > 0 && (
          <section aria-labelledby="gallery-heading" className="mt-24">
            <div className="flex items-baseline justify-between gap-6 border-t border-[var(--hairline)] pt-10">
              <h2
                id="gallery-heading"
                className="font-heading text-title font-normal tracking-tight text-[var(--ink)]"
              >
                More from {product.categoryName}
              </h2>
              <p className="shrink-0 font-body text-caption uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                {product.gallery.length} styles
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {product.gallery.map((image, i) => (
                <Inview
                  key={image.src}
                  delayIn={Math.min(i * 60, 360)}
                  stiffness={190}
                  damping={26}
                  from={{ opacity: 0, y: 24 }}
                  to={{ opacity: 1, y: 0 }}
                >
                  <HoverSpring to={{ scale: 1.04 }} stiffness={300} damping={22}>
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-tile bg-[var(--surface)]">
                      <Image
                        src={image.src}
                        alt={`${product.categoryName} apparel sample by Haram Textile`}
                        width={image.width}
                        height={image.height}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </HoverSpring>
                </Inview>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
