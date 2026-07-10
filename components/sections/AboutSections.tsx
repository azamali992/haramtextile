"use client";

import { Inview } from "@/components/motion/Inview";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealLines } from "@/components/motion/RevealLines";
import type { SiteContentTeamMember } from "@/lib/site-content";

interface AboutSectionsProps {
  whyPakistan: string[];
  /** What makes Haram Textile different from competitors. */
  usp: string;
  team: SiteContentTeamMember[];
}

/**
 * About page body: a USP section ("What sets us apart"), "Why Pakistan" as
 * numbered hairline rows, and the leadership team as ledger rows. Mission,
 * Vision & Values live in the shared `MissionVisionValues` section, rendered
 * separately by the page (also reused on Home).
 */
export function AboutSections({ whyPakistan, usp, team }: AboutSectionsProps) {
  return (
    <>
      {/* ── What sets us apart (USP) ── */}
      <section
        aria-labelledby="usp-heading"
        className="bg-[var(--background)] px-6 py-24 sm:px-10"
      >
        <div className="mx-auto max-w-[90rem]">
          <Eyebrow tone="dark">Why choose us</Eyebrow>
          <RevealLines
            lines={["What sets us", "apart"]}
            stagger={120}
            duration={0.95}
            className="mt-4 font-heading font-normal text-display text-[var(--ink)]"
          />
          <h2 id="usp-heading" className="sr-only">
            What Sets Haram Textile Apart
          </h2>
          <Inview
            delayIn={150}
            stiffness={180}
            damping={26}
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-2xl"
          >
            <p className="font-body text-body-lg leading-relaxed text-[var(--ink)]">
              {usp}
            </p>
          </Inview>
        </div>
      </section>

      {/* ── Why Pakistan — numbered hairline rows ── */}
      <section
        aria-labelledby="why-pakistan-heading"
        className="bg-[var(--surface)] px-6 py-24 sm:px-10"
      >
        <div className="mx-auto max-w-[90rem]">
          <Eyebrow tone="dark">Why Pakistan</Eyebrow>
          <RevealLines
            lines={["Why we manufacture", "in Pakistan"]}
            stagger={120}
            duration={0.95}
            className="mt-4 font-heading font-normal text-display text-[var(--ink)]"
          />
          <h2 id="why-pakistan-heading" className="sr-only">
            Why We Manufacture in Pakistan
          </h2>

          <ol className="mt-14 border-t border-[var(--hairline)]" role="list">
            {whyPakistan.map((reason, i) => (
              <Inview
                key={reason}
                delayIn={Math.min(i, 4) * 70}
                stiffness={190}
                damping={26}
                from={{ opacity: 0, y: 22 }}
                to={{ opacity: 1, y: 0 }}
              >
                <li className="grid grid-cols-[3.5rem_1fr] items-baseline gap-6 border-b border-[var(--hairline)] py-6 sm:grid-cols-[5rem_1fr]">
                  <span
                    className="font-heading text-title-sm italic text-[var(--brand-strong)]"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="max-w-3xl font-body text-body leading-relaxed text-[var(--ink)]">
                    {reason}
                  </p>
                </li>
              </Inview>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Leadership team — ledger rows ── */}
      <section
        aria-labelledby="team-heading"
        className="bg-[var(--background)] px-6 py-24 sm:px-10"
      >
        <div className="mx-auto max-w-[90rem]">
          <Eyebrow tone="dark">Our people</Eyebrow>
          <RevealLines
            lines={["Leadership team"]}
            stagger={120}
            duration={0.95}
            className="mt-4 font-heading font-normal text-display text-[var(--ink)]"
          />
          <h2 id="team-heading" className="sr-only">
            Leadership Team
          </h2>

          <ul className="mt-14 border-t border-[var(--hairline)]" role="list">
            {team.map((member, i) => (
              <Inview
                key={member.email}
                delayIn={Math.min(i, 4) * 80}
                stiffness={190}
                damping={26}
                from={{ opacity: 0, y: 22 }}
                to={{ opacity: 1, y: 0 }}
              >
                <li className="grid grid-cols-1 items-baseline gap-2 border-b border-[var(--hairline)] py-6 sm:grid-cols-[minmax(14rem,2fr)_minmax(10rem,1.5fr)_2fr]">
                  <p className="font-heading text-title-sm font-normal text-[var(--ink)]">
                    {member.name}
                  </p>
                  <p className="font-body text-caption font-medium uppercase tracking-[0.14em] text-[var(--brand-strong)]">
                    {member.role}
                  </p>
                  <a
                    href={`mailto:${member.email}`}
                    className="font-body text-caption text-[var(--ink-soft)] transition-colors duration-150 hover:text-[var(--brand-strong)] sm:justify-self-end"
                  >
                    {member.email}
                  </a>
                </li>
              </Inview>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
