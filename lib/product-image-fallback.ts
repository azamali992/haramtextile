/**
 * Presentation-layer fallback for product imagery.
 *
 * The DB's seeded `Product.imageUrl` is currently a placeholder string
 * pointing at the old legacy domain (no real Cloudinary upload has
 * happened yet — that comes later via the admin panel). Until then, we
 * fall back to real legacy product photos that were scraped into
 * `public/images/products/{category}/{n}.jpg`, keyed by category slug.
 *
 * This file only deals with local, already-known-dimension static assets
 * (no I/O), so it is safe to import from Server Components.
 */

export interface FallbackImage {
  src: string;
  width: number;
  height: number;
}

interface RawEntry {
  file: string;
  width: number;
  height: number;
}

/** DB category slugs -> local `public/images/products/<slug>` directory name (they match 1:1). */
const CATEGORY_SLUGS = ["boys", "girls", "ladies", "gents"] as const;
export type FallbackCategorySlug = (typeof CATEGORY_SLUGS)[number];

function isFallbackCategorySlug(value: string): value is FallbackCategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}

// Real dimensions of each copied legacy photo, captured once at copy time
// so every <Image> can have explicit width/height without a filesystem
// read at request time.
const MANIFEST: Record<FallbackCategorySlug, RawEntry[]> = {
  boys: [
    { file: "1.jpg", width: 646, height: 600 },
    { file: "2.jpg", width: 600, height: 450 },
    { file: "3.jpg", width: 580, height: 435 },
    { file: "4.jpg", width: 460, height: 433 },
    { file: "5.jpg", width: 460, height: 436 },
    { file: "6.jpg", width: 500, height: 580 },
    { file: "7.jpg", width: 422, height: 636 },
    { file: "8.jpg", width: 514, height: 614 },
    { file: "9.jpg", width: 456, height: 558 },
    { file: "10.jpg", width: 400, height: 524 },
    { file: "11.jpg", width: 463, height: 558 },
    { file: "12.jpg", width: 453, height: 500 },
    { file: "13.jpg", width: 530, height: 600 },
    { file: "14.jpg", width: 530, height: 600 },
    { file: "15.jpg", width: 530, height: 600 },
    { file: "16.jpg", width: 530, height: 600 },
    { file: "17.jpg", width: 530, height: 600 },
    { file: "18.jpg", width: 530, height: 600 },
    { file: "19.jpg", width: 530, height: 600 },
    { file: "20.jpg", width: 530, height: 600 },
    { file: "21.jpg", width: 530, height: 600 },
    { file: "22.jpg", width: 530, height: 600 },
    { file: "24.jpg", width: 530, height: 600 },
    { file: "25.jpg", width: 530, height: 600 },
  ],
  girls: [
    { file: "1.jpg", width: 533, height: 600 },
    { file: "2.jpg", width: 450, height: 600 },
    { file: "3.jpg", width: 450, height: 600 },
    { file: "4.jpg", width: 549, height: 500 },
    { file: "5.jpg", width: 515, height: 600 },
    { file: "6.jpg", width: 450, height: 600 },
    { file: "7.jpg", width: 375, height: 500 },
    { file: "8.jpg", width: 375, height: 500 },
    { file: "9.jpg", width: 450, height: 600 },
    { file: "10.jpg", width: 450, height: 600 },
    { file: "11.jpg", width: 375, height: 500 },
    { file: "12.jpg", width: 375, height: 500 },
    { file: "13.jpg", width: 530, height: 600 },
    { file: "14.jpg", width: 530, height: 600 },
    { file: "15.jpg", width: 530, height: 600 },
    { file: "16.jpg", width: 530, height: 600 },
    { file: "17.jpg", width: 530, height: 600 },
    { file: "18.jpg", width: 530, height: 600 },
  ],
  ladies: [
    { file: "1.jpg", width: 530, height: 600 },
    { file: "2.jpg", width: 500, height: 433 },
    { file: "3.jpg", width: 530, height: 600 },
    { file: "4.jpg", width: 500, height: 614 },
    { file: "5.jpg", width: 530, height: 600 },
    { file: "6.jpg", width: 500, height: 591 },
    { file: "7.jpg", width: 450, height: 600 },
    { file: "8.jpg", width: 450, height: 600 },
    { file: "9.jpg", width: 476, height: 600 },
    { file: "10.jpg", width: 415, height: 500 },
    { file: "11.jpg", width: 500, height: 667 },
    { file: "12.jpg", width: 450, height: 600 },
    { file: "13.jpg", width: 580, height: 534 },
    { file: "14.jpg", width: 530, height: 600 },
    { file: "15.jpg", width: 530, height: 600 },
    { file: "16.jpg", width: 580, height: 482 },
    { file: "17.jpg", width: 526, height: 680 },
    { file: "18.jpg", width: 375, height: 580 },
  ],
  gents: [
    { file: "1.jpg", width: 393, height: 600 },
    { file: "2.jpg", width: 436, height: 600 },
    { file: "3.jpg", width: 531, height: 600 },
    { file: "4.jpg", width: 626, height: 500 },
    { file: "5.jpg", width: 558, height: 442 },
    { file: "6.jpg", width: 450, height: 600 },
    { file: "7.jpg", width: 481, height: 600 },
    { file: "8.jpg", width: 494, height: 500 },
    { file: "9.jpg", width: 476, height: 600 },
    { file: "10.jpg", width: 509, height: 574 },
    { file: "11.jpg", width: 395, height: 500 },
    { file: "12.jpg", width: 375, height: 500 },
    { file: "14.jpg", width: 530, height: 600 },
    { file: "15.jpg", width: 489, height: 652 },
    { file: "17.jpg", width: 489, height: 652 },
  ],
};

/** A reasonable cover photo for category-level cards (hero/product-grid tiles). */
const COVER_INDEX = 0;

/**
 * Returns true when a DB `imageUrl` is a usable, absolute/rooted URL we
 * can hand straight to `next/image` (vs. a legacy placeholder string that
 * points nowhere real, e.g. `https://www.haramtextile.com/images/...`).
 */
export function isPlaceholderImageUrl(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return true;
  return imageUrl.includes("haramtextile.com") || imageUrl.startsWith("placeholder/");
}

/** Deterministically picks one fallback photo for a given category + seed (e.g. product id). */
export function getFallbackImageForCategory(
  categorySlug: string,
  seed?: string,
): FallbackImage | null {
  if (!isFallbackCategorySlug(categorySlug)) return null;
  const entries = MANIFEST[categorySlug];
  if (entries.length === 0) return null;

  const index = seed
    ? Math.abs(hashString(seed)) % entries.length
    : COVER_INDEX;
  const entry = entries[index];

  return {
    src: `/images/products/${categorySlug}/${entry.file}`,
    width: entry.width,
    height: entry.height,
  };
}

/** Returns the full gallery of fallback photos for a category (used on listing/detail pages). */
export function getFallbackGalleryForCategory(categorySlug: string): FallbackImage[] {
  if (!isFallbackCategorySlug(categorySlug)) return [];
  return MANIFEST[categorySlug].map((entry) => ({
    src: `/images/products/${categorySlug}/${entry.file}`,
    width: entry.width,
    height: entry.height,
  }));
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
