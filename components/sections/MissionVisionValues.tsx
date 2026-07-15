"use client";

import { Inview } from "@/components/motion/Inview";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealLines } from "@/components/motion/RevealLines";
import type { SiteContentValue } from "@/lib/site-content";

interface MissionVisionValuesProps {
  mission: string;
  vision: string;
  values: SiteContentValue[];
  /** Background tone. @default "background" */
  tone?: "background" | "surface";
  className?: string;
}

/**
 * Mission / Vision / Values band - shared between the About and Home pages.
 * Mission renders as a large serif statement (2/3 width), Vision as the
 * single dark card, and the six Values as a hairline-divided grid, each
 * with a gold dot, name, and description.
 */
export function MissionVisionValues({
  mission,
  vision,
  values,
  tone = "background",
  className = "",
}: MissionVisionValuesProps) {
  const sectionBg = tone === "surface" ? "bg-[var(--surface)]" : "bg-[var(--background)]";

  return (
    <section
      aria-labelledby="mission-vision-heading"
      className={`${sectionBg} px-6 py-24 sm:px-10 ${className}`}
    >
      <div className="mx-auto max-w-[90rem]">
        <Eyebrow tone="dark">Mission &amp; vision</Eyebrow>
        <RevealLines
          lines={["What we believe", "and where we're going"]}
          stagger={120}
          duration={0.95}
          className="mt-4 font-heading font-normal text-display text-[var(--ink)]"
        />
        <h2 id="mission-vision-heading" className="sr-only">
          Mission, Vision &amp; Values
        </h2>

        {/* Mission (large serif) + Vision (dark card) */}
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <Inview
            stiffness={190}
            damping={26}
            from={{ opacity: 0, y: 30 }}
            to={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div>
              <p className="font-body text-eyebrow font-medium uppercase text-[var(--ink-soft)]">
                Our mission
              </p>
              <p className="mt-5 max-w-2xl font-heading text-title font-normal leading-snug text-[var(--ink)] sm:text-[2.25rem]">
                {mission}
              </p>
            </div>
          </Inview>

          <Inview
            delayIn={120}
            stiffness={190}
            damping={26}
            from={{ opacity: 0, y: 30 }}
            to={{ opacity: 1, y: 0 }}
          >
            <div className="rounded-card bg-[var(--brand-deep)] p-7">
              <p className="font-body text-eyebrow font-medium uppercase text-on-brand/70">
                Our vision
              </p>
              <p className="mt-4 font-heading text-title-sm font-normal italic leading-snug text-[var(--on-brand)]">
                {vision}
              </p>
            </div>
          </Inview>
        </div>

        {/* Values grid - hairline-divided, dot + name + description */}
        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-10 border-t border-[var(--hairline)] pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value, i) => (
            <Inview
              key={value.name}
              delayIn={Math.min(i, 5) * 70}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 22 }}
              to={{ opacity: 1, y: 0 }}
            >
              <div className="group -mx-4 rounded-tile border-l-2 border-transparent px-4 py-1 transition-colors duration-200 hover:border-[var(--brand)] hover:bg-[var(--surface-card)]">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand)] transition-all duration-200 group-hover:h-2 group-hover:w-2"
                  aria-hidden="true"
                />
                <h3 className="mt-4 font-heading text-title-sm font-normal text-[var(--ink)] transition-colors duration-200 group-hover:text-[var(--brand-strong)]">
                  {value.name}
                </h3>
                <p className="mt-2 font-body text-body leading-relaxed text-[var(--ink-soft)]">
                  {value.description}
                </p>
              </div>
            </Inview>
          ))}
        </div>
      </div>
    </section>
  );
}
