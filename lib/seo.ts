/**
 * Pure SEO helper functions — no DB calls, no I/O. Callers (route handlers,
 * server components) are responsible for fetching data and passing it in.
 */
import type { Metadata } from "next";

const COMPANY_NAME = "Haram Textile";
const SITE_TITLE_SUFFIX_FALLBACK = `${COMPANY_NAME} — Apparel Manufacturer Pakistan`;
const DEFAULT_META_DESCRIPTION_FALLBACK =
  "Haram Textile is a leading manufacturer and exporter of textile and knitted garments in Pakistan, specializing in knitwear, T-shirts, polo shirts, and sweatshirts for boys, girls, ladies, and men.";

export interface MetadataOverrides {
  /** Page-specific title segment, e.g. "Boys Collection". Omit for the homepage. */
  title?: string;
  description?: string;
  /** Absolute or relative path to a representative OG/Twitter image. */
  imageUrl?: string;
  /** Canonical path for this page, e.g. "/products/boys". */
  path?: string;
  /** Override the default "index, follow" robots directive. */
  noIndex?: boolean;
}

export interface GlobalSeoDefaults {
  siteTitleSuffix?: string | null;
  defaultMetaDescription?: string | null;
  siteUrl?: string;
}

/**
 * Strips characters/sequences that could be used to break out of a
 * JSON-LD `<script type="application/ld+json">` block or inject markup,
 * since these strings frequently originate from admin-editable DB fields.
 *
 * - Removes HTML tags entirely.
 * - Neutralizes the literal sequence `</script` (case-insensitive) which
 *   is the classic JSON-LD escape vector, even though JSON.stringify
 *   already escapes quotes — the closing tag itself is the danger here.
 */
export function sanitizeForJsonLd(value: string): string {
  return value
    .replace(/<\/?[^>]+>/g, "")
    .replace(/<\/script/gi, "<\\/script")
    .replace(/<!--/g, "")
    .trim();
}

/** Recursively sanitizes all string values in a plain object/array before JSON-LD serialization. */
function sanitizeDeep<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeForJsonLd(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDeep(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = sanitizeDeep(val);
    }
    return result as T;
  }
  return value;
}

/**
 * Builds a Next.js `Metadata` object by merging page-specific overrides
 * with site-wide defaults. Title pattern: "[Page Name] | [Company Name] —
 * Apparel Manufacturer Pakistan" (or just the suffix on its own for the
 * homepage, when no page-specific title is given).
 */
export function buildMetadata(
  overrides: MetadataOverrides = {},
  globalDefaults: GlobalSeoDefaults = {},
): Metadata {
  const suffix = globalDefaults.siteTitleSuffix?.trim() || SITE_TITLE_SUFFIX_FALLBACK;
  const description =
    overrides.description?.trim() ||
    globalDefaults.defaultMetaDescription?.trim() ||
    DEFAULT_META_DESCRIPTION_FALLBACK;

  const title = overrides.title ? `${overrides.title} | ${suffix}` : suffix;
  const siteUrl = globalDefaults.siteUrl?.replace(/\/$/, "") ?? "";
  const canonicalPath = overrides.path ?? "";
  const url = siteUrl ? `${siteUrl}${canonicalPath}` : canonicalPath || undefined;

  const images = overrides.imageUrl ? [{ url: overrides.imageUrl }] : undefined;

  return {
    title,
    description,
    alternates: url ? { canonical: url } : undefined,
    robots: overrides.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: COMPANY_NAME,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: overrides.imageUrl ? [overrides.imageUrl] : undefined,
    },
  };
}

export interface OrganizationSchemaInput {
  name?: string | null;
  description?: string | null;
  url?: string | null;
  logoUrl?: string | null;
  sameAs?: string[] | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

/** Builds a sanitized schema.org `Organization` JSON-LD object. */
export function buildOrganizationSchema(input: OrganizationSchemaInput): object {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name ?? COMPANY_NAME,
    description: input.description ?? undefined,
    url: input.url ?? undefined,
    logo: input.logoUrl ?? undefined,
    sameAs: input.sameAs && input.sameAs.length > 0 ? input.sameAs : undefined,
    contactPoint:
      input.phone || input.email
        ? {
            "@type": "ContactPoint",
            telephone: input.phone ?? undefined,
            email: input.email ?? undefined,
            contactType: "sales",
          }
        : undefined,
    address: input.address
      ? { "@type": "PostalAddress", streetAddress: input.address }
      : undefined,
  };

  return sanitizeDeep(schema);
}

export interface ProductSchemaInput {
  name: string;
  description?: string | null;
  imageUrl: string;
  url?: string | null;
  categoryName?: string | null;
  brandName?: string | null;
}

/** Builds a sanitized schema.org `Product` JSON-LD object. */
export function buildProductSchema(input: ProductSchemaInput): object {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description ?? undefined,
    image: input.imageUrl,
    url: input.url ?? undefined,
    category: input.categoryName ?? undefined,
    brand: {
      "@type": "Brand",
      name: input.brandName ?? COMPANY_NAME,
    },
  };

  return sanitizeDeep(schema);
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/** Builds a sanitized schema.org `FAQPage` JSON-LD object. */
export function buildFaqSchema(faqs: FaqEntry[]): object {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return sanitizeDeep(schema);
}

export interface WebSiteSchemaInput {
  name?: string | null;
  url?: string | null;
  /** Path pattern containing the literal token `{query}`, e.g. "/products?search={query}". */
  searchPath?: string | null;
}

/**
 * Builds a sanitized schema.org `WebSite` JSON-LD object, optionally with a
 * `SearchAction` `potentialAction` when `searchPath` is provided.
 */
export function buildWebSiteSchema(input: WebSiteSchemaInput): object {
  const siteUrl = input.url?.replace(/\/$/, "") ?? "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name ?? COMPANY_NAME,
    url: input.url ?? undefined,
    potentialAction: input.searchPath
      ? {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}${input.searchPath}`,
          },
          "query-input": "required name=query",
        }
      : undefined,
  };

  return sanitizeDeep(schema);
}

export interface LocalBusinessSchemaInput {
  name?: string | null;
  description?: string | null;
  url?: string | null;
  logoUrl?: string | null;
  imageUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  /** Full street address string, e.g. "7-km, Millat Chock, ... Faisalabad, Pakistan". */
  address?: string | null;
  /** Additional schema.org `@type` values to merge in alongside "LocalBusiness", e.g. ["ClothingStore"]. */
  additionalTypes?: string[] | null;
  geo?: { latitude: number; longitude: number } | null;
  /** e.g. ["Mo-Sa 09:30-18:00"] in schema.org day/time notation. */
  openingHours?: string[] | null;
}

/** Builds a sanitized schema.org `LocalBusiness` JSON-LD object. */
export function buildLocalBusinessSchema(input: LocalBusinessSchemaInput): object {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", ...(input.additionalTypes ?? [])],
    name: input.name ?? COMPANY_NAME,
    description: input.description ?? undefined,
    url: input.url ?? undefined,
    logo: input.logoUrl ?? undefined,
    image: input.imageUrl ?? undefined,
    telephone: input.phone ?? undefined,
    email: input.email ?? undefined,
    address: input.address
      ? { "@type": "PostalAddress", streetAddress: input.address }
      : undefined,
    geo: input.geo
      ? {
          "@type": "GeoCoordinates",
          latitude: input.geo.latitude,
          longitude: input.geo.longitude,
        }
      : undefined,
    openingHours:
      input.openingHours && input.openingHours.length > 0 ? input.openingHours : undefined,
  };

  return sanitizeDeep(schema);
}

export interface ItemListEntry {
  name: string;
  url: string;
  imageUrl?: string | null;
}

/** Builds a sanitized schema.org `ItemList` JSON-LD object (e.g. product or certification grids). */
export function buildItemListSchema(items: ItemListEntry[]): object {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
      image: item.imageUrl ?? undefined,
    })),
  };

  return sanitizeDeep(schema);
}

export interface HowToStepInput {
  name: string;
  text: string;
  imageUrl?: string | null;
  url?: string | null;
}

export interface HowToSchemaInput {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  steps: HowToStepInput[];
}

/** Builds a sanitized schema.org `HowTo` JSON-LD object (e.g. the production-process page). */
export function buildHowToSchema(input: HowToSchemaInput): object {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description ?? undefined,
    image: input.imageUrl ?? undefined,
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.imageUrl ?? undefined,
      url: step.url ?? undefined,
    })),
  };

  return sanitizeDeep(schema);
}

export interface BreadcrumbEntry {
  name: string;
  url: string;
}

/** Builds a sanitized schema.org `BreadcrumbList` JSON-LD object. */
export function buildBreadcrumbSchema(items: BreadcrumbEntry[]): object {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return sanitizeDeep(schema);
}

export interface AboutPageSchemaInput {
  name?: string | null;
  description?: string | null;
  url?: string | null;
}

/** Builds a sanitized schema.org `AboutPage` JSON-LD object. */
export function buildAboutPageSchema(input: AboutPageSchemaInput): object {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: input.name ?? `About ${COMPANY_NAME}`,
    description: input.description ?? undefined,
    url: input.url ?? undefined,
  };

  return sanitizeDeep(schema);
}

export interface ContactPageSchemaInput {
  name?: string | null;
  description?: string | null;
  url?: string | null;
  phone?: string | null;
  email?: string | null;
}

/** Builds a sanitized schema.org `ContactPage` JSON-LD object. */
export function buildContactPageSchema(input: ContactPageSchemaInput): object {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: input.name ?? `Contact ${COMPANY_NAME}`,
    description: input.description ?? undefined,
    url: input.url ?? undefined,
    mainEntity:
      input.phone || input.email
        ? {
            "@type": "Organization",
            name: COMPANY_NAME,
            contactPoint: {
              "@type": "ContactPoint",
              telephone: input.phone ?? undefined,
              email: input.email ?? undefined,
              contactType: "sales",
            },
          }
        : undefined,
  };

  return sanitizeDeep(schema);
}
