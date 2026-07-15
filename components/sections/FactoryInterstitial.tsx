import Image from "next/image";
import { Parallax } from "@/components/motion/Parallax";
import { Inview } from "@/components/motion/Inview";
import { siteContent } from "@/lib/site-content";

interface FactoryInterstitialProps {
  /** Extra classes on the outer section. */
  className?: string;
}

/**
 * Full-bleed factory interstitial — a viewport-height dark image panel that
 * sits between MissionVisionValues and ProductCylinderShowcase on the homepage.
 *
 * Breaks out of the main px-2/px-3 page inset via negative margins so the
 * image bleeds edge-to-edge with no border-radius, creating a visual "reset"
 * between the two cream editorial sections. The parallax plate moves at 15 %
 * the scroll speed, creating depth without scrolljacking.
 *
 * Content:
 *   • Factory floor area (sourced from siteContent.stats, with numeric
 *     fallback) in an oversized headline weight
 *   • Gold hairline divider
 *   • "Est. [founded] · Faisalabad, Pakistan" provenance line
 *
 * Server Component: no "use client" needed — Parallax and Inview are client
 * components rendered via the App Router boundary.
 */
export function FactoryInterstitial({ className = "" }: FactoryInterstitialProps) {
  const factoryAreaStat = siteContent.stats.find(
    (s) => s.label === "Factory area (sq ft)",
  );
  // Format raw number as "30,000" — fall back to a safe display string
  const factoryArea = factoryAreaStat
    ? factoryAreaStat.value.toLocaleString("en-US")
    : "30,000";

  // `founded` in the content JSON is a full ISO-ish date (e.g. "2009-12-19");
  // display just the four-digit year, falling back to the raw value.
  const foundedRaw = siteContent.site.founded;
  const founded = foundedRaw?.match(/\d{4}/)?.[0] ?? foundedRaw;

  return (
    /*
     * -mx-2 sm:-mx-3 cancels the homepage <main>'s px-2 sm:px-3 inset so
     * this section bleeds to the true viewport edge on both sides.
     * overflow-hidden clips the Parallax plate that extends 16 % beyond the
     * element bounds.
     */
    <section
      className={`relative -mx-2 overflow-hidden sm:-mx-3 ${className}`}
      style={{ minHeight: "60vh" }}
      aria-label="Factory scale"
    >
      {/* ── Parallax background plate ── */}
      <div className="absolute inset-0">
        <Parallax range={["0%", "15%"]}>
          <Image
            src="/images/about/about-factory.jpg"
            alt="Haram Textile manufacturing facility — purpose-built garment production in Faisalabad, Pakistan"
            fill
            sizes="100vw"
            className="object-cover"
            loading="lazy"
          />
          {/* Scrim: subtle at top (image readable), denser at bottom for text legibility */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-scrim/55 via-scrim/60 to-scrim/80"
            aria-hidden="true"
          />
        </Parallax>
      </div>

      {/* ── Centred text overlay ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center sm:px-10">
        {/* Factory area — oversized display figure */}
        <Inview
          stiffness={180}
          damping={26}
          from={{ opacity: 0, y: 36 }}
          to={{ opacity: 1, y: 0 }}
        >
          <p
            className="font-heading font-normal leading-none tracking-tight text-[var(--on-brand)]"
            style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)" }}
          >
            {factoryArea}
            <span className="ml-3 align-middle font-body font-normal uppercase tracking-[0.2em] text-on-brand/70"
              style={{ fontSize: "clamp(0.875rem, 1.8vw, 1.375rem)" }}>
              sq&nbsp;ft
            </span>
          </p>
        </Inview>

        {/* Gold hairline + provenance line */}
        <Inview
          delayIn={160}
          stiffness={180}
          damping={26}
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
        >
          <div
            className="mx-auto mt-9 h-px w-20 bg-[var(--brand)]"
            aria-hidden="true"
          />
          <p className="mt-9 font-body uppercase tracking-[0.22em] text-on-brand/65"
            style={{ fontSize: "clamp(0.6875rem, 1.2vw, 0.875rem)" }}>
            Est.&nbsp;{founded}&nbsp;&middot;&nbsp;Faisalabad,&nbsp;Pakistan
          </p>
        </Inview>
      </div>
    </section>
  );
}
