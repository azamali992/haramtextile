import type { Metadata } from "next";
import { listProducts } from "@/lib/services/product.service";
import { listCertifications } from "@/lib/services/certification.service";
import { getHeroConfig } from "@/lib/services/hero.service";
import { listClientLogos } from "@/lib/services/client-logo.service";
import { getAboutContent } from "@/lib/services/about-content.service";
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
  ] = await Promise.all([
    listProducts({}),
    listCertifications(),
    getHeroConfig(),
    listClientLogos(),
    getAboutContent(),
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

  // ── Product cylinder: a curated cross-category sample of real products —
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
      alt: `${product.name} — Haram Textile ${product.category.name}`,
      href: `/catalog/${product.id}`,
    };
  });

  // ── Process gallery — a vertical cylinder of real factory photos, one per
  //    manufacturing stage ────────────────────────────────────────────────
  const processImages = siteContent.manufacturing.map((step) => ({
    src: getFallbackImageForProductionStep(step.slug),
    alt: `${step.name} stage at Haram Textile's Faisalabad factory`,
  }));

  // ── Stats formatted for StatBand ────────────────────────────────────────
  // `layout="row"` renders exactly 4 equal columns (see StatBand.tsx) — pick
  // the 4 most distinct scale metrics; siteContent.stats has 5 entries, and
  // "Sewing machines" overlaps narratively with "Specialized machines".
  const HOME_STAT_LABELS = [
    "Specialized machines",
    "Workers & staff",
    "Factory area (sq ft)",
    "Packing capacity (Pcs/month)",
  ];
  const statItems = HOME_STAT_LABELS.map((label) => {
    const s = siteContent.stats.find((stat) => stat.label === label)!;
    return {
      label: s.label,
      value:
        s.value >= 1_000_000
          ? `${(s.value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`
          : s.value >= 1_000
            ? `${Math.round(s.value / 1_000)}K+`
            : String(s.value),
    };
  });

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

      {/* 2 ── Capability band — what we do, at a glance ─────────────────────── */}
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

      {/* 5 ── Stats band — numbered row ──────────────────────────────────────── */}
      <StatBand
        title={["Manufacturing", "at scale"]}
        stats={statItems}
        tone="cream"
        layout="row"
        className="mt-3"
      />

      {/* 6 ── Pull-quote — full-bleed dark photo band ────────────────────────── */}
      <PullQuote
        quote={siteContent.site.quote}
        attribution="Haram Textile — Faisalabad, Pakistan"
        certBadges={certBadges.length > 0 ? certBadges : undefined}
        photoBackground="/images/about/about-factory.jpg"
      />

      {/* 7 ── Product collections — 3D cylinder carousel ─────────────────────── */}
      <ProductCylinderShowcase
        eyebrow="What we make"
        title={["Our collections"]}
        body={siteContent.home.productLine}
        items={cylinderItems}
      />

      {/* 8 ── FAQ ──────────────────────────────────────────────────────────── */}
      <FaqAccordion faqs={HOME_FAQS} />

      {/* 9 ── Process gallery — vertical cylinder, sits directly above the
              footer ─────────────────────────────────────────────────────── */}
      <ProcessShowcase
        eyebrow="Our process"
        title={["From yarn", "to carton"]}
        body="Every stage happens in-house across 30,000 sq ft of purpose-built facilities in Faisalabad — knitting, dyeing, cutting, printing, embroidery, sewing, and finishing & packing, all under one roof."
        images={processImages}
      />

      {/* JSON-LD (kept exactly as before) */}
      <JsonLd data={localBusinessSchema} />
    </main>
  );
}
