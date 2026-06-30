"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface FilterBarCategory {
  slug: string;
  name: string;
}

interface FilterBarProps {
  categories: FilterBarCategory[];
}

/** Tab-style category filter — reads/writes the `?category=` search param. */
export function FilterBar({ categories }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";
  const [isPending, startTransition] = useTransition();

  function handleSelect(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/products?${query}` : "/products");
    });
  }

  const tabs = [{ slug: "", name: "All Products" }, ...categories];

  return (
    <nav aria-label="Filter products by category" className="border-b border-cream-dark">
      <ul
        aria-busy={isPending}
        className={`flex flex-wrap gap-2 px-4 py-4 sm:px-6 lg:px-8 ${isPending ? "pointer-events-none opacity-60" : ""}`}
      >
        {tabs.map((tab) => {
          const isActive = tab.slug === activeCategory;
          return (
            <li key={tab.slug || "all"}>
              <button
                type="button"
                onClick={() => handleSelect(tab.slug)}
                aria-current={isActive ? "true" : undefined}
                className={`min-h-11 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-green-primary text-cream-off"
                    : "bg-cream text-brown-deep hover:bg-cream-dark"
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
