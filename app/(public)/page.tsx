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

// ─── Section components ───────────────────────────────────────────────────────
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { NumberedList } from "@/components/sections/NumberedList";
import { TiltedPhotoPair } from "@/components/sections/TiltedPhotoPair";
import { StatBand } from "@/components/sections/StatBand";
import { PullQuote } from "@/components/sections/PullQuote";
import { ContactCTABand } from "@/components/sections/ContactCTABand";

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

  // ── Deduped category slides for the hero carousel ──────────────────────────
  const categoriesSeen = new Set<string>();
  const heroSlides = products
    .filter((product) => {
      if (categoriesSeen.has(product.category.slug)) return false;
      categoriesSeen.add(product.category.slug);
      return true;
    })
    .map((product) => {
      const fallback = getFallbackImageForCategory(product.category.slug);
      return {
        slug: product.category.slug,
        name: product.category.name,
        intro:
          siteContent.productCategories.find(
            (c) => c.slug === product.category.slug,
          )?.intro ?? "",
        image: fallback ?? {
          src: "/images/hero/hero-factory.jpg",
          width: 800,
          height: 600,
        },
      };
    });

  // ── Numbered list items from siteContent.productCategories ─────────────────
  const numberedListItems = siteContent.productCategories.map((cat, i) => ({
    index: String(i + 1).padStart(2, "0"),
    name: cat.name,
    description: cat.intro,
    href: `/products?category=${cat.slug}`,
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

  // ── Production step tiles (first two, with placeholder fallback) ───────────
  // Tiles need: src, alt, name, description, tone
  const PRODUCTION_FALLBACKS: Array<{
    src: string;
    alt: string;
    tone: "green" | "gold";
  }> = [
    {
      src: "/images/hero/hero-factory.jpg",
      alt: "Haram Textile production facility — knitting and sewing floor",
      tone: "green",
    },
    {
      src: "/images/about/about-factory.jpg",
      alt: "Haram Textile factory workers operating sewing machines",
      tone: "gold",
    },
  ];

  const [tileA, tileB] = [0, 1].map((idx) => {
    const step = productionSteps[idx];
    const fb = PRODUCTION_FALLBACKS[idx]!;
    const src =
      step?.imageUrl && !isPlaceholderImageUrl(step.imageUrl)
        ? step.imageUrl
        : fb.src;
    return {
      src,
      alt: step ? step.title : fb.alt,
      name: step?.title ?? (idx === 0 ? "Knitting" : "Sewing"),
      description:
        step?.description ??
        (idx === 0
          ? "State-of-the-art knitting machines producing all fabric types."
          : "160 sewing machines with complete gauges and attachments."),
      tone: fb.tone,
    };
  });

  // ── Pull-quote certification badges ────────────────────────────────────────
  const certBadges = certifications.map((c) => ({
    name: c.name,
    issuingBody: c.issuingBody ?? null,
  }));

  return (
    /*
     * The page inset (px-2 sm:px-3) gives every section its rounded-card
     * framing against the cream page background, matching the reference spec's
     * "0.5rem / 0.75rem page inset" that rounds each section as a card.
     */
    <main className="px-2 sm:px-3">
      {/* 1 ── Hero ──────────────────────────────────────────────────────────── */}
      <HeroSection
        headline={heroConfig?.headline ?? siteContent.site.tagline}
        subtext={heroConfig?.subtext ?? "Crafted for, Global Markets"}
        ctaText={heroConfig?.ctaText ?? "Get a Quote"}
        ctaLink={heroConfig?.ctaLink ?? null}
        heroImage={heroImage}
        slides={heroSlides}
        stats={siteContent.stats}
      />

      {/* 2 ── Trust / social proof ─────────────────────────────────────────── */}
      <TrustSection
        clientLogos={clientLogos}
        certifications={certifications}
      />

      {/* 3 ── Product categories numbered list ─────────────────────────────── */}
      <NumberedList
        eyebrow="What we make"
        title={["Our", "Collections"]}
        items={numberedListItems}
        className="mt-3"
      />

      {/* 4 ── Facilities / production photo pair ───────────────────────────── */}
      <TiltedPhotoPair
        intro={{
          eyebrow: "Our process",
          title: ["World-Class", "Production"],
          body: "From knitting and dyeing through cutting, stitching, printing, embroidery, and finishing — every step happens in-house across 30,000 sq ft of purpose-built facilities.",
          iconImage: {
            src: "/images/about/about-factory.jpg",
            alt: "Haram Textile factory floor",
          },
        }}
        tiles={[tileA, tileB] as [typeof tileA, typeof tileB]}
      />

      {/* 5 ── Stats band ───────────────────────────────────────────────────── */}
      <StatBand
        eyebrow="By the numbers"
        title={["Manufacturing", "at scale"]}
        stats={statItems}
        tone="green"
        className="mt-3"
      />

      {/* 6 ── Pull-quote / repurposed testimonials ─────────────────────────── */}
      <PullQuote
        eyebrow="Our commitment"
        title={["Trusted by", "global brands"]}
        quote={siteContent.site.quote}
        attribution="Haram Textile — Faisalabad, Pakistan"
        certBadges={certBadges.length > 0 ? certBadges : undefined}
      />

      {/* 7a ── Contact CTA band ─────────────────────────────────────────────── */}
      <ContactCTABand
        eyebrow="Get started"
        title={["Ready to", "start your order?"]}
        ctaLabel="Get a Quote"
      />

      {/* 7b ── FAQ ──────────────────────────────────────────────────────────── */}
      <FaqAccordion faqs={HOME_FAQS} />

      {/* JSON-LD (kept exactly as before) */}
      <JsonLd data={localBusinessSchema} />
    </main>
  );
}
