import Link from "next/link";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Inview } from "@/components/motion/Inview";

interface Capability {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const ICON_PROPS = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const CAPABILITIES: Capability[] = [
  {
    label: "Knitting & Dyeing",
    description:
      "State-of-the-art knitting for fleece, terry, rib and jacquard fabrics, finished with in-house dyeing and garment washing.",
    href: "/production#knitting",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="12" r="8" />
        <path d="M8 9c1.5 1.5 3 1.5 4.5 0S16 7.5 16 9M8 15c1.5-1.5 3-1.5 4.5 0s3.5 1.5 3.5 0" />
      </svg>
    ),
  },
  {
    label: "Cutting & Sewing",
    description:
      "CAD/CAM pattern grading and precision cutting, feeding 160+ sewing machines across a full range of specialized stitch stations.",
    href: "/production#cutting",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <path d="M8.5 7.5L19 18M8.5 16.5L19 6" />
      </svg>
    ),
  },
  {
    label: "Printing & Embroidery",
    description:
      "Screen, foil, and heat-transfer printing alongside multi-head embroidery, supporting production up to 5,000 panels a day.",
    href: "/production#printing",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="4" y="9" width="16" height="9" rx="1.5" />
        <path d="M7 9V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M8 13h8" />
      </svg>
    ),
  },
  {
    label: "Finishing & Packing",
    description:
      "A trained finishing and packing team ships to a capacity of 70,000 pieces a month, matched to each buyer's requirements.",
    href: "/production#packing",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 8l8-4 8 4-8 4-8-4Z" />
        <path d="M4 8v8l8 4 8-4V8M12 12v8" />
      </svg>
    ),
  },
];

interface CapabilityBandProps {
  className?: string;
}

/**
 * Four-column "what we do" band: icon + label + short description + a
 * "Learn more" link deep-linking to the matching `/production#{slug}`
 * section. Sits directly under the hero as a capability-at-a-glance teaser;
 * full detail lives on the Production page.
 */
export function CapabilityBand({ className = "" }: CapabilityBandProps) {
  return (
    <section className={`bg-[var(--background)] px-6 py-20 sm:px-10 ${className}`}>
      <div className="mx-auto max-w-[90rem]">
        <SectionHeader
          eyebrow="What we do"
          title={["Full-service garment manufacturing"]}
          titleClassName="max-w-2xl text-display text-[var(--ink)]"
        />

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[var(--hairline)]">
          {CAPABILITIES.map((cap, i) => (
            <Inview
              key={cap.label}
              delayIn={Math.min(i * 90, 270)}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 24 }}
              to={{ opacity: 1, y: 0 }}
              className={i > 0 ? "lg:pl-8" : ""}
            >
              <div className="grid size-12 place-items-center rounded-full bg-[var(--brand-light)]/25 text-[var(--brand-strong)]">
                {cap.icon}
              </div>
              <h3 className="mt-6 font-body text-sm font-medium uppercase tracking-[0.14em] text-[var(--ink)]">
                {cap.label}
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-[var(--ink-soft)]">
                {cap.description}
              </p>
              <Link
                href={cap.href}
                className="mt-5 inline-flex items-center gap-1.5 border-b border-[var(--brand)] pb-0.5 font-body text-xs uppercase tracking-[0.14em] text-[var(--ink)] transition-colors duration-150 hover:text-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
              >
                Learn more
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </Inview>
          ))}
        </div>
      </div>
    </section>
  );
}
