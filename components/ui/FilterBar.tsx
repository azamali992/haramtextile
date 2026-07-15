"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface FilterBarCategory {
  slug: string;
  name: string;
}

interface FilterBarProps {
  categories: FilterBarCategory[];
  /**
   * Controlled active slug. When `onSelect` is provided the bar is fully
   * controlled and performs no navigation — the parent owns the state (used
   * by ProductsBrowser for client-side animated filtering). When omitted,
   * the bar falls back to reading/writing the `?category=` URL param.
   */
  active?: string;
  onSelect?: (slug: string) => void;
}

/** Pill-tab category filter — controlled via `onSelect`, or URL-driven by default. */
export function FilterBar({ categories, active, onSelect }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const controlled = onSelect !== undefined;
  const activeCategory = controlled ? active ?? "" : searchParams.get("category") ?? "";

  function handleSelect(slug: string) {
    if (controlled) {
      onSelect!(slug);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/catalog?${query}` : "/catalog");
    });
  }

  const tabs = [{ slug: "", name: "All Products" }, ...categories];

  return (
    <nav aria-label="Filter products by category" className="px-6 sm:px-10">
      <ul
        aria-busy={isPending}
        className={`mx-auto flex max-w-[90rem] flex-wrap gap-2.5 border-t border-[var(--hairline)] py-6 ${isPending ? "pointer-events-none opacity-60" : ""}`}
      >
        {tabs.map((tab) => {
          const isActive = tab.slug === activeCategory;
          return (
            <li key={tab.slug || "all"}>
              <button
                type="button"
                onClick={() => handleSelect(tab.slug)}
                aria-current={isActive ? "true" : undefined}
                className={`min-h-11 rounded-pill px-5 py-2 font-body text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
                  isActive
                    ? "bg-[var(--brand-deep)] text-[var(--on-brand)]"
                    : "border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--ink)]"
                }`}
              >
                {tab.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
