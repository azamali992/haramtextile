import type { Metadata } from "next";
import { listProducts } from "@/lib/services/product.service";
import { listCertifications } from "@/lib/services/certification.service";
import { getHeroConfig } from "@/lib/services/hero.service";
import { listClientLogos } from "@/lib/services/client-logo.service";
import { getAboutContent } from "@/lib/services/about-content.service";
import { listProductionSteps } from "@/lib/services/production-step.service";
import { listStats } from "@/lib/services/stat.service";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent, resolveStats } from "@/lib/site-content";
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
import { CapabilityBand } from "@/components/sections/CapabilityBand";
import { TrustSection } from "@/components/sections/TrustSection";
import { MissionVisionValues } from "@/components/sections/MissionVisionValues";
import { ProductCylinderShowcase } from "@/components/sections/ProductCylinderShowcase";
import { StatBand } from "@/components/sections/StatBand";
import { PullQuote } from "@/components/sections/PullQuote";
import { ProcessShowcase } from "@/components/sections/ProcessShowcase";

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

// ─── FAQ data ─────────────────────────────────────────────────────────────────

/** Builds the home FAQ list from the resolved (DB-or-fallback) stats. */
function buildHomeFaqs(stats: ReadonlyArray<{ label: string; value: number }>) {
  const byLabel = (label: string) => stats.find((s) => s.label === label)?.value;
  return [
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
      answer: `We operate ${byLabel("Specialized machines") ?? ""} specialized machines and ${
        byLabel("Sewing machines") ?? ""
      } sewing machines across a ${
        byLabel("Factory area (sq ft)")?.toLocaleString() ?? ""
      } sq ft facility, with a packing capacity of ${
        byLabel("Packing capacity (Pcs/month)")?.toLocaleString() ?? ""
      } pieces per month.`,
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [
    { products },
    certifications,
    heroConfig,
    clientLogos,
    // aboutContent consumed by hero/trust if needed - kept for admin-editable field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _aboutContent,
    productionSteps,
    dbStats,
  ] = await Promise.all([
    listProducts({}),
    listCertifications(),
    getHeroConfig(),
    listClientLogos(),
    getAboutContent(),
    listProductionSteps(),
    listStats(),
  ]);

  // Stats: DB rows (admin-editable) with static fallback. The row layout
  // shows 4 columns, so take the first 4 in admin order.
  const resolvedStats = resolveStats(dbStats);
  const HOME_FAQS = buildHomeFaqs(resolvedStats);

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

  // ── Product cylinder: a curated cross-category sample of real products -
  //    up to 3 per category so every collection is represented without
  //    overcrowding the 3D carousel ────────────────────────────────────────
  const productsByCategory = new Map<string, typeof products>();
  for (const product of products) {
    const bucket = productsByCategory.get(product.category.slug) ?? [];
    bucket.push(product);
    productsByCategory.set(product.category.slug, bucket);
  }
  const CYLINDER_PER_CATEGORY = 3;
  const cylinderProducts = Array.from(productsByCategory.values()).flatMap(
    (bucket) => bucket.slice(0, CYLINDER_PER_CATEGORY),
  );

  const cylinderItems = cylinderProducts.map((product) => {
    const usableImage = !isPlaceholderImageUrl(product.imageUrl);
    const fallback = getFallbackImageForCategory(product.category.slug, product.id);
    const src = usableImage
      ? product.imageUrl
      : (fallback?.src ?? "/images/hero/hero-factory.jpg");
    return {
      src,
      alt: `${product.name} - Haram Textile ${product.category.name}`,
      href: `/catalog/${product.id}`,
    };
  });

  // ── Process stack - DB steps (admin-editable), with the static
  //    siteContent stages as a fallback if the table is empty ─────────────
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

  // ── Stats formatted for StatBand ────────────────────────────────────────
  // `layout="row"` renders exactly 4 equal columns (see StatBand.tsx), so
  // take the first 4 resolved stats in admin order.
  const statItems = resolvedStats.slice(0, 4).map((s) => ({
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

      {/* 2 ── Capability band - what we do, at a glance ─────────────────────── */}
      <CapabilityBand />

      {/* 3 ── Mission, Vision & Values ──────────────────────────────────────── */}
      <MissionVisionValues
        mission={siteContent.about.mission}
        vision={siteContent.about.vision}
        values={siteContent.about.values}
        tone="surface"
      />

      {/* 4 ── Trust / social proof ─────────────────────────────────────────── */}
      <TrustSection
        clientLogos={clientLogos}
        certifications={certifications}
      />

      {/* 5 ── Stats band - numbered row ──────────────────────────────────────── */}
      <StatBand
        title={["Manufacturing", "at scale"]}
        stats={statItems}
        tone="cream"
        layout="row"
        className="mt-3"
      />

      {/* 6 ── Pull-quote - full-bleed dark photo band ────────────────────────── */}
      <PullQuote
        quote={siteContent.site.quote}
        attribution="Haram Textile - Faisalabad, Pakistan"
        certBadges={certBadges.length > 0 ? certBadges : undefined}
        photoBackground="/images/about/about-factory.jpg"
      />

      {/* 7 ── Product collections - 3D cylinder carousel ─────────────────────── */}
      <ProductCylinderShowcase
        eyebrow="What we make"
        title={["Our collections"]}
        body={siteContent.home.productLine}
        items={cylinderItems}
      />

      {/* 8 ── FAQ ──────────────────────────────────────────────────────────── */}
      <FaqAccordion faqs={HOME_FAQS} />

      {/* 9 ── Process stack - 3D vertical carousel, sits directly above the
              footer ─────────────────────────────────────────────────────── */}
      <ProcessShowcase eyebrow="Our process" steps={processSteps} />

      {/* JSON-LD (kept exactly as before) */}
      <JsonLd data={localBusinessSchema} />
    </main>
  );
}
