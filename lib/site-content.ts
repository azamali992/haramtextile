/**
 * Typed accessor for `extracted-data/site-content.json` - the scraped
 * legacy-site content (team, stats, manufacturing process descriptions,
 * contact details, etc.) that has no equivalent DB table. Imported as a
 * static JSON module (via `resolveJsonModule`), so this has no runtime
 * I/O and is safe to use from Server Components and `lib/seo.ts` callers.
 */
import siteContentJson from "@/extracted-data/site-content.json";

export interface SiteContentEmail {
  label: string;
  email: string;
}

export interface SiteContentTeamMember {
  name: string;
  role: string;
  email: string;
}

export interface SiteContentStat {
  label: string;
  value: number;
}

export interface SiteContentValue {
  name: string;
  description: string;
}

export interface SiteContentProductCategory {
  slug: string;
  name: string;
  intro: string;
  imageDir: string;
  images: string[];
}

export interface SiteContentManufacturingStep {
  slug: string;
  name: string;
  description: string;
  imageDir: string;
  images: string[];
}

export interface SiteContent {
  site: {
    name: string;
    tagline: string;
    founded: string;
    quote: string;
    designCredit: string;
    baseUrl: string;
  };
  contact: {
    phone: string;
    emails: SiteContentEmail[];
    address: string;
    mapLink: string;
    hours: string;
  };
  team: SiteContentTeamMember[];
  stats: SiteContentStat[];
  home: {
    products: string;
    objective: string;
    markets: string;
    aboutShort: string;
    socialCompliance: string;
    fashionConcepts: string;
    productLine: string;
  };
  about: {
    intro: string;
    whyPakistan: string[];
    vision: string;
    values: SiteContentValue[];
    mission: string;
    usp: string;
  };
  certifications: {
    intro: string;
    list: string[];
    documents: string[];
  };
  productCategories: SiteContentProductCategory[];
  manufacturing: SiteContentManufacturingStep[];
}

export const siteContent = siteContentJson as SiteContent;

/** Maps a legacy `productCategories[].slug` to the DB `Category.slug` ("gents" is the only mismatch - legacy used "gents" too, so this is an identity map kept explicit for clarity). */
export function getSiteContentCategory(slug: string) {
  return siteContent.productCategories.find((category) => category.slug === slug);
}
