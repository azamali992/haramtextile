import type { Metadata } from "next";
import { listProductionSteps } from "@/lib/services/production-step.service";
import { listStats } from "@/lib/services/stat.service";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent, resolveStats } from "@/lib/site-content";
import { buildMetadata, buildHowToSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StatBand } from "@/components/sections/StatBand";
import { PhotoHero } from "@/components/sections/PhotoHero";
import { ProductionStepsClient } from "@/components/sections/ProductionStepsClient";
import { isPlaceholderImageUrl } from "@/lib/product-image-fallback";
import { getFallbackImageForProductionStep } from "@/lib/production-image-fallback";

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

/** Builds the production FAQ list from the resolved (DB-or-fallback) stats. */
function buildProductionFaqs(stats: ReadonlyArray<{ label: string; value: number }>) {
  const byLabel = (label: string) => stats.find((s) => s.label === label)?.value;
  return [
    {
      question: "How many stages does Haram Textile's production process have?",
      answer:
        "Production runs through seven stages: Knitting, Dyeing, Cutting, Printing, Embroidery, Sewing, and Finishing & Packing - all completed in-house at our Faisalabad facility.",
    },
    {
      question: "What is Haram Textile's sewing and packing capacity?",
      answer: `We operate ${byLabel("Sewing machines") ?? 160} sewing machines and pack more than ${
        byLabel("Packing capacity (Pcs/month)")?.toLocaleString() ?? "600,000"
      } pieces per month, backed by ${
        byLabel("Workers & staff") ?? 350
      } workers and staff across the factory floor.`,
    },
    {
      question: "Can printing and embroidery be customized per order?",
      answer:
        "Yes. Our printing department supports screen printing, heat transfer, puff print, rubber print, high-density print, flocking, glitter, foil, and discharge printing through a dedicated design studio producing up to 5,000 garment cut panels per day, while our embroidery line ranges from simple to complex multi-needle designs for both small and large volume orders.",
    },
  ];
}

/** Abbreviate large numbers for StatBand display */
function formatStatValue(value: number): string {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M+`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K+`;
  return value.toLocaleString();
}

export default async function ProductionPage() {
  const [steps, dbStats] = await Promise.all([listProductionSteps(), listStats()]);
  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const resolvedStats = resolveStats(dbStats);
  const PRODUCTION_FAQS = buildProductionFaqs(resolvedStats);

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

  // `layout="row"` renders exactly 4 equal columns (see StatBand.tsx), so
  // take the first 4 resolved stats in admin order.
  const statItems = resolvedStats.slice(0, 4).map((s) => ({
    value: formatStatValue(s.value),
    label: s.label,
  }));

  /** Resolve image fallbacks server-side - per-step local photos by slug */
  const stepItems = steps.map((step) => ({
    id: step.id,
    slug: step.slug,
    title: step.title,
    description: step.description,
    statLabel: step.statLabel ?? null,
    statValue: step.statValue ?? null,
    imageUrl: isPlaceholderImageUrl(step.imageUrl)
      ? getFallbackImageForProductionStep(step.slug)
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

      {/* Photo hero - the visible page opener */}
      <div className="px-2 sm:px-3">
        <PhotoHero
          eyebrow="In-house manufacturing"
          title="From yarn to carton"
          subtitle="Seven stages under one roof - knitting, dyeing, cutting, printing, embroidery, sewing, and packing."
          imageSrc="/images/hero/hero-factory.jpg"
          imageAlt="Haram Textile production floor in Faisalabad, Pakistan"
          as="p"
        />
      </div>

      {/* h1 for screen readers and SEO */}
      <h1 className="sr-only">Our Production Process</h1>

      {/* Production steps */}
      <section aria-labelledby="steps-heading" className="px-6 py-24 sm:px-10 sm:py-32">
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

      {/* Stats band - below the steps */}
      <StatBand
        eyebrow="By the numbers"
        title={["Capacity that", "keeps delivering"]}
        stats={statItems}
        tone="cream"
        layout="row"
        className="mx-2 sm:mx-3"
      />

      <FaqAccordion faqs={PRODUCTION_FAQS} title="Production Process FAQs" />

      <JsonLd data={howToSchema} />
    </main>
  );
}
