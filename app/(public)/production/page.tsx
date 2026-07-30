import type { Metadata } from "next";
import { listProductionSteps } from "@/lib/services/production-step.service";
import { listStats } from "@/lib/services/stat.service";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent, resolveStats } from "@/lib/site-content";
import { buildMetadata, buildHowToSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
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
      title: "Business Functions",
      description: siteContent.home.aboutShort,
      path: "/production",
    },
    {
      siteTitleSuffix: seoSettings?.siteTitleSuffix,
      siteUrl: config.NEXT_PUBLIC_SITE_URL,
    },
  );
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
          { name: "Business Functions", url: `${baseUrl}/production` },
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
      <h1 className="sr-only">Business Functions</h1>

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

      <JsonLd data={howToSchema} />
    </main>
  );
}
