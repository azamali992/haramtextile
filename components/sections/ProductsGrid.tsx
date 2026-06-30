"use client";

import { Inview } from "@/components/motion/Inview";
import { ProductCard, type ProductCardData } from "@/components/ui/Card";

interface ProductsGridProps {
  products: ProductCardData[];
}

/**
 * Motion-wrapped product card grid. Wraps each `ProductCard` in an Inview
 * rise-in (stagger i × 60ms, capped at 420ms) to match the reference spec's
 * in-view reveal pattern.
 *
 * Kept as a client component so Inview (Framer Motion) runs correctly.
 * All data is resolved server-side in the page and passed as props.
 */
export function ProductsGrid({ products }: ProductsGridProps) {
  const MAX_STAGGER_MS = 420;

  return (
    <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <Inview
          key={product.id}
          delayIn={Math.min(index * 60, MAX_STAGGER_MS)}
          stiffness={190}
          damping={26}
          from={{ opacity: 0, y: 30 }}
          to={{ opacity: 1, y: 0 }}
        >
          <ProductCard product={product} />
        </Inview>
      ))}
    </div>
  );
}
