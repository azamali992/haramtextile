import type { Metadata } from "next";
import { listProducts } from "@/lib/services/product.service";
import { listCertifications } from "@/lib/services/certification.service";
import { getHeroConfig } from "@/lib/services/hero.service";
import { listClientLogos } from "@/lib/services/client-logo.service";
import { getAboutContent } from "@/lib/services/about-content.service";
import { listProductionSteps } from "@/lib/services/production-step.service";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import { buildMetadata, buildLocalBusinessSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import {
  isPlaceholderImageUrl,
  getFallbackImageForCategory,
} from "@/lib/product-image-fallback";
import { getFallbackImageForProductionStep } from "@/lib/production-image-fallback";

// ─── Section components ───────────────────────────────────────────────────────
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { MissionVisionValues } from "@/components/sections/MissionVisionValues";
import { ProductShowcaseCarousel } from "@/components/sections/ProductShowcaseCarousel";
import { ProcessCarousel } from "@/components/sections/ProcessCarousel";
import { StatBand } from "@/components/sections/StatBand";
import { PullQuote } from "@/components/sections/PullQuote";
import { FactoryInterstitial } from "@/components/sections/FactoryInterstitial";

export const dynamic = "force-dynamic";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings().catch(() => null);

  return buildMetadata(
    { path: "/" },
    {
      siteTitleSuffix: seoSettings?.siteTitleSuffix,
      defaultMetaDescription:
        seoSettings?.defaultMetaDescription ?? siteContent.home.aboutShort,
      siteUrl: config.NEXT_PUBLIC_SITE_URL,
    },
  );
}

// ─── FAQ data (kept exactly as before) ───────────────────────────────────────

const HOME_FAQS = [
  {
    question: "What does Haram Textile manufacture?",
    answer: siteContent.home.productLine,
  },
  {
    question: "Where is Haram Textile located?",
    answer: `Our factory is located at ${siteContent.contact.address}.`,
  },
  {
    question: "What certifications does Haram Textile hold?",
    answer: `Haram Textile holds ${siteContent.certifications.list.join(", ")}. ${siteContent.certifications.intro}`,
  },
  {
    question: "What is Haram Textile's production capacity?",
    answer: `We operate ${
      siteContent.stats.find((s) => s.label === "Specialized machines")
        ?.value ?? ""
    } specialized machines and ${
      siteContent.stats.find((s) => s.label === "Sewing machines")?.value ?? ""
    } sewing machines across a ${
      siteContent.stats
        .find((s) => s.label === "Factory area (sq ft)")
        ?.value.toLocaleString() ?? ""
    } sq ft facility, with a packing capacity of ${
      siteContent.stats
        .find((s) => s.label === "Packing capacity (Pcs/month)")
        ?.value.toLocaleString() ?? ""
    } pieces per month.`,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [
    { products },
    certifications,
    heroConfig,
    clientLogos,
    // aboutContent consumed by hero/trust if needed — kept for admin-editable field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _aboutContent,
    productionSteps,
  ] = await Promise.all([
    listProducts({}),
    listCertifications(),
    getHeroConfig(),
    listClientLogos(),
    getAboutContent(),
    listProductionSteps(),
  ]);

  // ── Hero image (fallback as before) ────────────────────────────────────────
  const heroImage =
    heroConfig?.imageUrl && !isPlaceholderImageUrl(heroConfig.imageUrl)
      ? heroConfig.imageUrl
      : "/images/hero/hero-factory.jpg";

  // ── JSON-LD (kept exactly) ─────────────────────────────────────────────────
  const localBusinessSchema = buildLocalBusinessSchema({
    name: siteContent.site.name,
    description: siteContent.home.aboutShort,
    url: config.NEXT_PUBLIC_SITE_URL,
    additionalTypes: ["ClothingStore"],
    phone: siteContent.contact.phone,
    email: siteContent.contact.emails[0]?.email,
    address: siteContent.contact.address,
    openingHours: ["Mo-Sa 09:30-18:00"],
  });

  // ── Product showcase slides: one card per category — DB categories first
  //    (admin-controlled naming/order), then any siteContent category not yet
  //    represented, so the carousel always shows the full range ───────────────
  const categoriesSeen = new Set<string>();
  const showcaseCategories = products
    .filter((product) => {
      if (categoriesSeen.has(product.category.slug)) return false;
      categoriesSeen.add(product.category.slug);
      return true;
    })
    .map((product) => ({
      slug: product.category.slug,
      name: product.category.name,
    }));
  for (const cat of siteContent.productCategories) {
    if (!categoriesSeen.has(cat.slug)) {
      categoriesSeen.add(cat.slug);
      showcaseCategories.push({ slug: cat.slug, name: cat.name });
    }
  }

  const showcaseSlides = showcaseCategories.map((category, i) => {
    const fallback = getFallbackImageForCategory(category.slug);
    return {
      index: String(i + 1).padStart(2, "0"),
      slug: category.slug,
      name: category.name,
      intro:
        siteContent.productCategories.find((c) => c.slug === category.slug)
          ?.intro ?? "",
      image: fallback ?? {
        src: "/images/hero/hero-factory.jpg",
        width: 800,
        height: 600,
      },
    };
  });

  // ── Process carousel slides (DB steps; siteContent fallback if DB empty) ───
  const processSteps =
    productionSteps.length > 0
      ? productionSteps.map((step) => ({
          slug: step.slug,
          title: step.title,
          description: step.description,
          statLabel: step.statLabel ?? null,
          statValue: step.statValue ?? null,
          imageUrl: isPlaceholderImageUrl(step.imageUrl)
            ? getFallbackImageForProductionStep(step.slug)
            : step.imageUrl,
        }))
      : siteContent.manufacturing.map((step) => ({
          slug: step.slug,
          title: step.name,
          description: step.description,
          statLabel: null,
          statValue: null,
          imageUrl: getFallbackImageForProductionStep(step.slug),
        }));

  // ── Stats formatted for StatBand ───────────────────────────────────────────
  const statItems = siteContent.stats.map((s) => ({
    label: s.label,
    value:
      s.value >= 1_000_000
        ? `${(s.value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`
        : s.value >= 1_000
          ? `${Math.round(s.value / 1_000)}K+`
          : String(s.value),
  }));

  // ── Pull-quote certification badges ────────────────────────────────────────
  const certBadges = certifications.map((c) => ({
    name: c.name,
    issuingBody: c.issuingBody ?? null,
  }));

  return (
    /*
     * The page inset (px-2 sm:px-3) gives the hero and green bands their
     * rounded-card framing against the cream page background.
     */
    <main className="px-2 sm:px-3">
      {/* 1 ── Hero ──────────────────────────────────────────────────────────── */}
      <HeroSection
        headline={heroConfig?.headline ?? siteContent.site.tagline}
        subtext={heroConfig?.subtext ?? "Crafted for, Global Markets"}
        ctaText={heroConfig?.ctaText ?? "Get a Quote"}
        ctaLink={heroConfig?.ctaLink ?? null}
        heroImage={heroImage}
      />

      {/* 2 ── Trust / social proof ─────────────────────────────────────────── */}
      <TrustSection
        clientLogos={clientLogos}
        certifications={certifications}
      />

      {/* 3 ── Mission, Vision & Values ──────────────────────────────────────── */}
      <MissionVisionValues
        mission={siteContent.about.mission}
        vision={siteContent.about.vision}
        values={siteContent.about.values}
        tone="surface"
      />

      {/* 3½ ── Full-bleed factory interstitial — scale reset between sections ─ */}
      <FactoryInterstitial />

      {/* 4 ── Product collections — horizontal carousel ────────────────────── */}
      <ProductShowcaseCarousel
        eyebrow="What we make"
        title={["Our collections"]}
        body={siteContent.home.productLine}
        slides={showcaseSlides}
      />

      {/* 5 ── Production process — horizontal carousel on green ────────────── */}
      <ProcessCarousel
        eyebrow="Our process"
        title={["From yarn", "to carton"]}
        body="Every stage happens in-house across 30,000 sq ft of purpose-built facilities in Faisalabad."
        steps={processSteps}
      />

      {/* 6 ── Stats band ───────────────────────────────────────────────────── */}
      <StatBand
        title={["Manufacturing", "at scale"]}
        stats={statItems}
        tone="cream"
        className="mt-3"
      />

      {/* 7 ── Pull-quote ───────────────────────────────────────────────────── */}
      <PullQuote
        quote={siteContent.site.quote}
        attribution="Haram Textile — Faisalabad, Pakistan"
        certBadges={certBadges.length > 0 ? certBadges : undefined}
      />

      {/* 8 ── FAQ ──────────────────────────────────────────────────────────── */}
      <FaqAccordion faqs={HOME_FAQS} />

      {/* JSON-LD (kept exactly as before) */}
      <JsonLd data={localBusinessSchema} />
    </main>
  );
}
