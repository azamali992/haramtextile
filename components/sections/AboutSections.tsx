"use client";

import { Inview } from "@/components/motion/Inview";
import { HoverSpring } from "@/components/motion/HoverSpring";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealLines } from "@/components/motion/RevealLines";
import type { SiteContentTeamMember } from "@/lib/site-content";

interface AboutSectionsProps {
  whyPakistan: string[];
  mission: string;
  vision: string;
  values: string[];
  aboutShort: string;
  team: SiteContentTeamMember[];
}

/**
 * Client section component rendering the "Why Pakistan", Mission/Vision/Values,
 * and Leadership Team sections of the About page with Inview reveals.
 *
 * Separated into a client component so Framer Motion animations work correctly
 * while the page server component handles all data fetching.
 */
export function AboutSections({
  whyPakistan,
  mission,
  vision,
  values,
  aboutShort,
  team,
}: AboutSectionsProps) {
  return (
    <>
      {/* ── Our Story short ── */}
      <section
        aria-labelledby="story-short-heading"
        className="bg-[var(--background)] px-6 py-20 sm:px-10"
      >
        <div className="mx-auto max-w-[90rem]">
          <Eyebrow tone="dark">Our story</Eyebrow>
          <RevealLines
            lines={["Built in Pakistan,", "trusted worldwide"]}
            stagger={120}
            duration={0.95}
            className="mt-4 font-heading text-[3rem] leading-[0.95] tracking-tight text-[var(--ink)]"
          />
          <Inview
            delayIn={150}
            stiffness={180}
            damping={26}
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-2xl"
          >
            <p className="font-body text-base leading-relaxed text-[var(--ink-soft)]">
              {aboutShort}
            </p>
          </Inview>
        </div>
      </section>

      {/* ── Why Pakistan ── */}
      <section
        aria-labelledby="why-pakistan-heading"
        className="bg-[var(--surface)] px-6 py-20 sm:px-10"
      >
        <div className="mx-auto max-w-[90rem]">
          <Eyebrow tone="dark">Why Pakistan</Eyebrow>
          <RevealLines
            lines={["Why we manufacture", "in Pakistan"]}
            stagger={120}
            duration={0.95}
            className="mt-4 font-heading text-[3rem] leading-[0.95] tracking-tight text-[var(--ink)]"
          />
          <h2 id="why-pakistan-heading" className="sr-only">
            Why We Manufacture in Pakistan
          </h2>

          <ul
            className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            role="list"
          >
            {whyPakistan.map((reason, i) => (
              <Inview
                key={reason}
                delayIn={i * 80}
                stiffness={190}
                damping={26}
                from={{ opacity: 0, y: 26 }}
                to={{ opacity: 1, y: 0 }}
              >
                <HoverSpring to={{ y: -6 }} stiffness={300} damping={22}>
                  <li className="rounded-[var(--radius-card)] bg-[var(--background)] p-6">
                    {/* Gold accent dot */}
                    <span
                      className="block h-2 w-2 rounded-full bg-[var(--brand)]"
                      aria-hidden="true"
                    />
                    <p className="mt-4 font-body text-sm leading-relaxed text-[var(--ink-soft)]">
                      {reason}
                    </p>
                  </li>
                </HoverSpring>
              </Inview>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Mission / Vision / Values ── */}
      <section
        aria-labelledby="mission-heading"
        className="bg-[var(--background)] px-6 py-20 sm:px-10"
      >
        <div className="mx-auto max-w-[90rem]">
          <Eyebrow tone="dark">Our principles</Eyebrow>
          <RevealLines
            lines={["Mission, Vision", "& Values"]}
            stagger={120}
            duration={0.95}
            className="mt-4 font-heading text-[3rem] leading-[0.95] tracking-tight text-[var(--ink)]"
          />
          <h2 id="mission-heading" className="sr-only">
            Mission, Vision &amp; Values
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Mission */}
            <Inview
              delayIn={0}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
            >
              <HoverSpring to={{ y: -8 }} stiffness={300} damping={22}>
                <div className="flex h-full flex-col rounded-[var(--radius-card)] bg-[var(--surface)] p-7">
                  <span
                    className="block h-2 w-2 rounded-full bg-[var(--brand)]"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 font-heading text-xl leading-tight tracking-tight text-[var(--ink)]">
                    Mission
                  </h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-[var(--ink-soft)]">
                    {mission}
                  </p>
                </div>
              </HoverSpring>
            </Inview>

            {/* Vision */}
            <Inview
              delayIn={120}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
            >
              <HoverSpring to={{ y: -8 }} stiffness={300} damping={22}>
                <div className="flex h-full flex-col rounded-[var(--radius-card)] bg-[var(--brand-deep)] p-7">
                  <span
                    className="block h-2 w-2 rounded-full bg-[var(--brand-light)]"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 font-heading text-xl leading-tight tracking-tight text-[var(--on-brand)]">
                    Vision
                  </h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-[rgba(253,250,246,0.75)]">
                    {vision}
                  </p>
                </div>
              </HoverSpring>
            </Inview>

            {/* Values */}
            <Inview
              delayIn={240}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
            >
              <HoverSpring to={{ y: -8 }} stiffness={300} damping={22}>
                <div className="flex h-full flex-col rounded-[var(--radius-card)] bg-[var(--surface)] p-7">
                  <span
                    className="block h-2 w-2 rounded-full bg-[var(--brand)]"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 font-heading text-xl leading-tight tracking-tight text-[var(--ink)]">
                    Values
                  </h3>
                  <ul className="mt-3 space-y-1">
                    {values.map((value) => (
                      <li
                        key={value}
                        className="font-body text-sm leading-relaxed text-[var(--ink-soft)]"
                      >
                        {value}
                      </li>
                    ))}
                  </ul>
                </div>
              </HoverSpring>
            </Inview>
          </div>
        </div>
      </section>

      {/* ── Leadership team ── */}
      <section
        aria-labelledby="team-heading"
        className="bg-[var(--surface)] px-6 py-20 sm:px-10"
      >
        <div className="mx-auto max-w-[90rem]">
          <Eyebrow tone="dark">Our people</Eyebrow>
          <RevealLines
            lines={["Leadership", "Team"]}
            stagger={120}
            duration={0.95}
            className="mt-4 font-heading text-[3rem] leading-[0.95] tracking-tight text-[var(--ink)]"
          />
          <h2 id="team-heading" className="sr-only">
            Leadership Team
          </h2>

          <ul
            className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            role="list"
          >
            {team.map((member, i) => (
              <Inview
                key={member.email}
                delayIn={i * 90}
                stiffness={190}
                damping={26}
                from={{ opacity: 0, y: 26 }}
                to={{ opacity: 1, y: 0 }}
              >
                <HoverSpring to={{ y: -6 }} stiffness={300} damping={22}>
                  <li className="rounded-[var(--radius-card)] bg-[var(--background)] p-6">
                    {/* Initial avatar */}
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-deep)] font-heading text-base text-[var(--on-brand)]"
                      aria-hidden="true"
                    >
                      {member.name.charAt(member.name.lastIndexOf(" ") + 1) || member.name[0]}
                    </span>
                    <p className="mt-4 font-heading text-lg leading-tight text-[var(--ink)]">
                      {member.name}
                    </p>
                    <p className="mt-1 font-body text-sm font-medium text-[var(--brand)]">
                      {member.role}
                    </p>
                    <a
                      href={`mailto:${member.email}`}
                      className="mt-2 block font-body text-xs text-[var(--ink-soft)] hover:text-[var(--brand)] transition-colors"
                    >
                      {member.email}
                    </a>
                  </li>
                </HoverSpring>
              </Inview>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
