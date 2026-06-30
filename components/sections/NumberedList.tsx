"use client";

import Link from "next/link";
import { Inview } from "@/components/motion/Inview";
import { HoverSpring } from "@/components/motion/HoverSpring";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealLines } from "@/components/motion/RevealLines";

export interface NumberedListItem {
  /** Display index, e.g. "01", "02", "03", "04". */
  index: string;
  /** Primary name/title, rendered in Playfair Display. */
  name: string;
  /** Short description shown below the name. */
  description: string;
  /** Destination URL for the row anchor. */
  href: string;
}

interface NumberedListProps {
  /** Optional eyebrow kicker. */
  eyebrow?: string;
  /**
   * Title lines for the section header.
   * @example ["Our", "Collections"]
   */
  title: string[];
  /** The list items to render. 4 items recommended (matches reference). */
  items: NumberedListItem[];
  /** Extra classes on the outer `<section>`. */
  className?: string;
}

const ARROW_PATH = "M5 12h14M13 6l6 6-6 6";

/**
 * Reference "Programs numbered list" pattern — 4 bordered rows, each a
 * `<Link>` with an index number, a Playfair name + description, and a
 * trailing spring-animated circle arrow.
 *
 * Rows spring in via Inview (delayIn = i × 90ms). Arrow springs
 * `x: 0 → 8, opacity: 0.55 → 1` on row hover (HoverSpring auto-disabled
 * on touch/reduced-motion).
 *
 * Prop API (for Phase 3b reuse):
 * ```
 * eyebrow?:  string
 * title:     string[]
 * items:     { index, name, description, href }[]
 * className?: string
 * ```
 *
 * @example
 * <NumberedList
 *   eyebrow="What we make"
 *   title={["Our", "Collections"]}
 *   items={siteContent.productCategories.map((cat, i) => ({
 *     index: String(i + 1).padStart(2, "0"),
 *     name: cat.name,
 *     description: cat.intro,
 *     href: `/products?category=${cat.slug}`,
 *   }))}
 * />
 */
export function NumberedList({
  eyebrow,
  title,
  items,
  className = "",
}: NumberedListProps) {
  return (
    <section
      id="programs"
      className={`bg-[var(--surface)] px-6 py-24 sm:px-10 ${className}`}
    >
      <div className="mx-auto max-w-[90rem]">
        {/* Header */}
        {eyebrow && <Eyebrow tone="dark">{eyebrow}</Eyebrow>}
        <RevealLines
          lines={title}
          stagger={120}
          duration={0.95}
          className="mt-4 font-heading text-[3rem] leading-[0.95] tracking-tight text-[var(--ink)]"
        />

        {/* Rows */}
        <ul className="mt-14" role="list">
          {items.map((item, i) => (
            <li
              key={item.href}
              className="border-t border-[var(--hairline)] last:border-b"
            >
              <Inview
                delayIn={i * 90}
                stiffness={190}
                damping={26}
                from={{ opacity: 0, y: 26 }}
                to={{ opacity: 1, y: 0 }}
              >
                <Link
                  href={item.href}
                  className="group flex items-center gap-6 py-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:rounded hover:bg-[var(--background)] transition-colors duration-150"
                >
                  {/* Index */}
                  <span className="w-10 shrink-0 font-body text-sm font-medium text-[var(--ink-soft)]">
                    {item.index}
                  </span>

                  {/* Name + description */}
                  <div className="flex-1 min-w-0">
                    <span className="block font-heading text-2xl leading-tight tracking-tight text-[var(--ink)] sm:text-[1.875rem]">
                      {item.name}
                    </span>
                    <span className="mt-1 block font-body text-sm text-[var(--ink-soft)]">
                      {item.description}
                    </span>
                  </div>

                  {/* Arrow circle — springs on group hover */}
                  <HoverSpring
                    to={{ x: 8, opacity: 1 }}
                    stiffness={300}
                    damping={20}
                    className="shrink-0"
                  >
                    <span
                      className="grid size-11 place-items-center rounded-[var(--radius-pill)] border border-[var(--hairline)] opacity-55 transition-opacity duration-150 group-hover:opacity-100"
                      aria-hidden="true"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={ARROW_PATH} />
                      </svg>
                    </span>
                  </HoverSpring>
                </Link>
              </Inview>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
