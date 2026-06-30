import type { Metadata } from "next";
import { listProductionSteps } from "@/lib/services/production-step.service";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import { buildMetadata, buildHowToSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StatBand } from "@/components/sections/StatBand";
import { ContactCTABand } from "@/components/sections/ContactCTABand";
import { ProductionStepsClient } from "@/components/sections/ProductionStepsClient";
import { isPlaceholderImageUrl } from "@/lib/product-image-fallback";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings().catch(() => null);

  return buildMetadata(
    {
      title: "Our Production Process",
      description: siteContent.home.aboutShort,
      path: "/production",
    },
    {
      siteTitleSuffix: seoSettings?.siteTitleSuffix,
      siteUrl: config.NEXT_PUBLIC_SITE_URL,
    },
  );
}

const SEWING_MACHINES_STAT = siteContent.stats.find((s) => s.label === "Sewing machines")?.value;
const PACKING_CAPACITY_STAT = siteContent.stats.find(
  (s) => s.label === "Packing capacity (Pcs/month)",
)?.value;

const PRODUCTION_FAQS = [
  {
    question: "How many stages does Haram Textile's production process have?",
    answer:
      "Production runs through seven stages: Knitting, Dyeing, Cutting, Printing, Embroidery, Sewing, and Finishing & Packing — all completed in-house at our Faisalabad facility.",
  },
  {
    question: "What is Haram Textile's sewing and packing capacity?",
    answer: `We operate ${SEWING_MACHINES_STAT ?? 160} sewing machines and pack more than ${PACKING_CAPACITY_STAT?.toLocaleString() ?? "600,000"} pieces per month, backed by ${siteContent.stats.find((s) => s.label === "Workers & staff")?.value ?? 350} workers and staff across the factory floor.`,
  },
  {
    question: "Can printing and embroidery be customized per order?",
    answer:
      "Yes. Our printing department supports screen printing, heat transfer, puff print, rubber print, high-density print, flocking, glitter, foil, and discharge printing through a dedicated design studio producing up to 5,000 garment cut panels per day, while our embroidery line ranges from simple to complex multi-needle designs for both small and large volume orders.",
  },
];

/** Abbreviate large numbers for StatBand display */
function formatStatValue(value: number): string {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M+`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K+`;
  return value.toLocaleString();
}

/** Production step fallback images (two per step, cycling through factory photos) */
const STEP_FALLBACKS = [
  "/images/hero/hero-factory.jpg",
  "/images/about/about-factory.jpg",
];

export default async function ProductionPage() {
  const steps = await listProductionSteps();
  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const howToSchema = buildHowToSchema({
    name: "How Haram Textile Manufactures Apparel",
    description: siteContent.home.aboutShort,
    steps: steps.map((step) => ({
      name: step.title,
      text: step.description,
      imageUrl: step.imageUrl,
      url: `${baseUrl}/production#${step.slug}`,
    })),
  });

  const statItems = siteContent.stats.map((s) => ({
    value: formatStatValue(s.value),
    label: s.label,
  }));

  /** Resolve image fallbacks server-side */
  const stepItems = steps.map((step, i) => ({
    id: step.id,
    slug: step.slug,
    title: step.title,
    description: step.description,
    statLabel: step.statLabel ?? null,
    statValue: step.statValue ?? null,
    imageUrl: isPlaceholderImageUrl(step.imageUrl)
      ? STEP_FALLBACKS[i % STEP_FALLBACKS.length]
      : step.imageUrl,
  }));

  return (
    <main>
      <Breadcrumb
        items={[
          { name: "Home", url: baseUrl, href: "/" },
          { name: "Production", url: `${baseUrl}/production` },
        ]}
      />

      {/* Visually-hidden h1 for screen readers and SEO — StatBand provides the visual headline */}
      <h1 className="sr-only">Our Production Process</h1>

      {/* Stats band header */}
      <StatBand
        eyebrow="In-house manufacturing"
        title={["From yarn", "to carton"]}
        stats={statItems}
        tone="green"
      />

      {/* Production steps */}
      <section aria-labelledby="steps-heading" className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-[90rem]">
          <h2 id="steps-heading" className="sr-only">
            Production Stages
          </h2>

          {steps.length === 0 ? (
            <p className="font-body text-base text-[var(--ink-soft)]">
              Production process details are being updated.
            </p>
          ) : (
            <ProductionStepsClient steps={stepItems} totalSteps={steps.length} />
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <ContactCTABand
        eyebrow="Work with us"
        title={["Start your", "production order"]}
        ctaLabel="Get a Quote"
      />

      <FaqAccordion faqs={PRODUCTION_FAQS} title="Production Process FAQs" />

      <JsonLd data={howToSchema} />
    </main>
  );
}
