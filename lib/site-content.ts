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

/**
 * Stats/team are now admin-editable DB tables (`Stat`, `TeamMember`). These
 * resolvers return the DB rows when present, otherwise fall back to the
 * static siteContent values - so the site keeps rendering even before the
 * tables are seeded, mirroring the production-steps fallback pattern.
 */
export function resolveStats(
  dbStats: ReadonlyArray<{ label: string; value: number }>,
): SiteContentStat[] {
  return dbStats.length > 0
    ? dbStats.map((s) => ({ label: s.label, value: s.value }))
    : siteContent.stats;
}

export function resolveTeam(
  dbTeam: ReadonlyArray<{ name: string; role: string; email: string }>,
): SiteContentTeamMember[] {
  return dbTeam.length > 0
    ? dbTeam.map((m) => ({ name: m.name, role: m.role, email: m.email }))
    : siteContent.team;
}

/** Shape the Contact page and footer consume. */
export interface ResolvedContact {
  phone: string;
  emails: SiteContentEmail[];
  address: string;
  mapLink: string;
  hours: string;
}

/**
 * Contact details are admin-editable via the `ContactSettings` singleton.
 * Returns the DB row when present, otherwise the static siteContent values.
 * `emails` is stored as JSON, so it is validated structurally here before use.
 */
export function resolveContact(
  dbContact: {
    phone: string;
    address: string;
    mapLink: string | null;
    hours: string | null;
    emails: unknown;
  } | null,
): ResolvedContact {
  if (!dbContact) return siteContent.contact;

  const emails = Array.isArray(dbContact.emails)
    ? (dbContact.emails as unknown[]).filter(
        (e): e is SiteContentEmail =>
          typeof e === "object" &&
          e !== null &&
          typeof (e as SiteContentEmail).label === "string" &&
          typeof (e as SiteContentEmail).email === "string",
      )
    : [];

  return {
    phone: dbContact.phone,
    address: dbContact.address,
    mapLink: dbContact.mapLink ?? siteContent.contact.mapLink,
    hours: dbContact.hours ?? siteContent.contact.hours,
    emails: emails.length > 0 ? emails : siteContent.contact.emails,
  };
}
