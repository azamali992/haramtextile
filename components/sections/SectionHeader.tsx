"use client";

import { Eyebrow, type EyebrowTone } from "@/components/ui/Eyebrow";
import { RevealLines } from "@/components/motion/RevealLines";

interface SectionHeaderProps {
  /** Optional kicker label rendered above the headline. */
  eyebrow?: string;
  /** Eyebrow tone - passed through to the Eyebrow component. */
  eyebrowTone?: EyebrowTone;
  /**
   * Title lines. Each string renders on its own line with the clip-mask
   * slide-up reveal. Typically 2–3 short strings.
   */
  title: string[];
  /** Optional body paragraph rendered below the title (plain text). */
  body?: string;
  /** Extra Tailwind classes on the outer wrapper div. */
  className?: string;
  /** Classes forwarded to the RevealLines wrapper (e.g. font size / color). */
  titleClassName?: string;
  /** Classes forwarded to the body paragraph. */
  bodyClassName?: string;
}

/**
 * Reusable section header pattern: Eyebrow kicker + RevealLines title +
 * optional body text. Mirrors the reference "Eyebrow + stacked headline"
 * that appears before every major section.
 *
 * Rendered as a client component so RevealLines (which uses Framer Motion
 * hooks) can execute correctly.
 *
 * @example
 * <SectionHeader
 *   eyebrow="By the numbers"
 *   eyebrowTone="light"
 *   title={["A factory that", "keeps delivering"]}
 *   body="220 specialized machines, 350 workers, 30 000 sq ft."
 * />
 */
export function SectionHeader({
  eyebrow,
  eyebrowTone = "dark",
  title,
  body,
  className = "",
  titleClassName = "",
  bodyClassName = "",
}: SectionHeaderProps) {
  return (
    <div className={className}>
      {eyebrow && <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>}
      <RevealLines
        lines={title}
        stagger={120}
        duration={0.95}
        className={`font-heading leading-[0.95] tracking-tight mt-4 ${titleClassName}`}
      />
      {body && (
        <p className={`mt-6 font-body text-sm leading-relaxed ${bodyClassName}`}>{body}</p>
      )}
    </div>
  );
}
