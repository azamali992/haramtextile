"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FilterBar, type FilterBarCategory } from "@/components/ui/FilterBar";
import { ProductCard, type ProductCardData } from "@/components/ui/Card";

export interface BrowserProduct extends ProductCardData {
  /** Category slug used for client-side filtering. */
  categorySlug: string;
}

interface ProductsBrowserProps {
  /** All products (unfiltered) — filtering happens client-side. */
  products: BrowserProduct[];
  categories: FilterBarCategory[];
  /** Initial active category slug (from the `?category=` URL param). */
  initialCategory?: string;
}

/**
 * Client-side product browser: owns the active-category state so switching
 * filters animates in place (cards that leave fade + scale out, remaining
 * cards spring to their new positions via layout animation) instead of a
 * full server navigation + grid swap.
 *
 * The URL is kept in sync with `history.replaceState` so category views stay
 * shareable, without triggering a Next navigation that would remount the grid
 * and kill the transition. Deep links still work because the server renders
 * the correct initial subset from `initialCategory`.
 */
export function ProductsBrowser({
  products,
  categories,
  initialCategory = "",
}: ProductsBrowserProps) {
  const [active, setActive] = useState(initialCategory);
  const prefersReducedMotion = useReducedMotion();

  const visible = active
    ? products.filter((product) => product.categorySlug === active)
    : products;

  function handleSelect(slug: string) {
    setActive(slug);
    if (typeof window !== "undefined") {
      const url = slug ? `/catalog?category=${slug}` : "/catalog";
      window.history.replaceState(window.history.state, "", url);
    }
  }

  return (
    <>
      <FilterBar categories={categories} active={active} onSelect={handleSelect} />

      <section
        aria-labelledby="product-grid-heading"
        className="px-6 py-14 sm:px-10 sm:py-16"
      >
        <h2 id="product-grid-heading" className="sr-only">
          All Products
        </h2>

        {visible.length === 0 ? (
          <div className="mx-auto max-w-[90rem] py-16">
            <p className="font-heading text-title font-normal text-[var(--ghost)]">
              Nothing here yet.
            </p>
            <p className="mt-4 max-w-xl font-body text-body text-[var(--ink-soft)]">
              No products found in this category yet. Please check back soon or{" "}
              <a
                href="/contact"
                className="text-[var(--brand-strong)] underline underline-offset-4 hover:text-[var(--brand-deep)]"
              >
                contact our export team
              </a>{" "}
              for current availability.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="mx-auto grid max-w-[90rem] grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.96 }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 260, damping: 30 }
                  }
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </>
  );
}
