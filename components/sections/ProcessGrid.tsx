"use client";

import Image from "next/image";
import Link from "next/link";
import { Inview } from "@/components/motion/Inview";
import { SectionHeader } from "@/components/sections/SectionHeader";

interface ProcessStep {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface ProcessGridProps {
  eyebrow?: string;
  title?: string[];
  steps: ProcessStep[];
  /** Base path each tile links to; the step slug is appended as an anchor. */
  ctaHref?: string;
  className?: string;
}

/**
 * Clean "Business Functions" grid: a simple, calm grid of the manufacturing
 * stages - each a photo tile with the stage name overlaid - plus a trailing
 * CTA tile linking to the full Business Functions page. Replaces the earlier
 * 3D process carousel with a flat, concise layout.
 */
export function ProcessGrid({
  eyebrow = "Our process",
  title = ["Business Functions"],
  steps,
  ctaHref = "/production",
  className = "",
}: ProcessGridProps) {
  return (
    <section className={`bg-[var(--surface)] px-6 py-16 sm:px-10 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-[90rem]">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          className="mb-12 flex flex-col items-center text-center sm:mb-14"
          titleClassName="text-title sm:text-display text-[var(--ink)]"
        />

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.slug}>
              <Inview
                delayIn={Math.min(i * 60, 360)}
                stiffness={190}
                damping={26}
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
              >
                <Link
                  href={`${ctaHref}#${step.slug}`}
                  className="group block overflow-hidden rounded-card border border-[var(--hairline)] bg-[var(--surface-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={step.imageUrl}
                      alt={step.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
                      aria-hidden="true"
                    />
                    <h3 className="absolute inset-x-0 bottom-0 p-4 font-heading text-lg font-semibold text-white sm:p-5">
                      {step.title}
                    </h3>
                  </div>
                </Link>
              </Inview>
            </li>
          ))}

          {/* Trailing CTA tile - fills the grid and links to the full page. */}
          <li>
            <Inview
              delayIn={Math.min(steps.length * 60, 360)}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
            >
              <Link
                href={ctaHref}
                className="group flex aspect-[4/5] flex-col items-start justify-between rounded-card bg-[var(--brand-deep)] p-6 text-[var(--on-brand)] transition-colors duration-200 hover:bg-[var(--brand-deeper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
              >
                <span className="font-body text-xs font-medium uppercase tracking-[0.22em] text-[var(--on-brand)]/70">
                  In-house, end to end
                </span>
                <span className="font-heading text-2xl font-semibold leading-tight">
                  Explore our full process
                  <span className="mt-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-[var(--brand-light)]">
                    View all stages
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>
              </Link>
            </Inview>
          </li>
        </ul>
      </div>
    </section>
  );
}
