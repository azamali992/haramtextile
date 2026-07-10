/**
 * Presentation-layer fallback for product imagery.
 *
 * The DB's seeded `Product.imageUrl` is currently a placeholder string
 * pointing at the old legacy domain (no real Cloudinary upload has
 * happened yet — that comes later via the admin panel). Until then, we
 * fall back to a fixed set of photos, keyed by category slug:
 * boys/girls/ladies use a newer set hosted on Cloudinary (uploaded via
 * `prisma/upload-product-images.ts`, source files in
 * `public/images/products_new/{category}` — not deployed, kept local only);
 * gents still uses the original scraped `public/images/products/gents` set
 * committed to the repo (no replacement photos exist for that category yet).
 *
 * This file only deals with static, already-known-dimension image
 * references (no I/O), so it is safe to import from Server Components.
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

interface CategoryManifest {
  /**
   * Either a directory under `public/images/` (e.g. "products/gents") or a
   * full Cloudinary delivery URL prefix (e.g.
   * "https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,w_auto/haram-textile/products_new/boys") —
   * `buildSrc` below tells the two apart.
   */
  dir: string;
  entries: RawEntry[];
}

/** Joins a manifest `dir` (local relative path or absolute Cloudinary URL) with a filename. */
function buildSrc(dir: string, file: string): string {
  return /^https?:\/\//.test(dir) ? `${dir}/${file}` : `/images/${dir}/${file}`;
}

// Real dimensions of each photo, captured once so every <Image> can have
// explicit width/height without a filesystem read at request time.
const MANIFEST: Record<FallbackCategorySlug, CategoryManifest> = {
  boys: {
    dir: "https://res.cloudinary.com/ds08efkdx/image/upload/f_auto,q_auto,w_auto/haram-textile/products_new/boys",
    entries: [
      { file: "1.png", width: 1183, height: 1329 },
      { file: "2.png", width: 1178, height: 1335 },
      { file: "3.png", width: 1200, height: 1311 },
      { file: "4.png", width: 1214, height: 1296 },
      { file: "5.png", width: 1182, height: 1330 },
      { file: "6.png", width: 1197, height: 1314 },
      { file: "7.png", width: 1161, height: 1355 },
      { file: "8.png", width: 1189, height: 1323 },
      { file: "9.png", width: 1176, height: 1338 },
      { file: "10.png", width: 1175, height: 1339 },
    ],
  },
  girls: {
    dir: "https://res.cloudinary.com/ds08efkdx/image/upload/f_auto,q_auto,w_auto/haram-textile/products_new/girls",
    entries: [
      { file: "1.png", width: 1197, height: 1314 },
      { file: "2.png", width: 1184, height: 1328 },
      { file: "3.png", width: 1195, height: 1316 },
      { file: "4.png", width: 1308, height: 1202 },
      { file: "5.png", width: 1225, height: 1284 },
      { file: "6.png", width: 1319, height: 1192 },
    ],
  },
  ladies: {
    dir: "https://res.cloudinary.com/ds08efkdx/image/upload/f_auto,q_auto,w_auto/haram-textile/products_new/ladies",
    entries: [
      { file: "1.png", width: 1120, height: 1405 },
      { file: "2.png", width: 1125, height: 1398 },
      { file: "3.png", width: 1309, height: 1202 },
      { file: "4.png", width: 1327, height: 1186 },
      { file: "5.png", width: 1129, height: 1393 },
      { file: "6.png", width: 1315, height: 1196 },
      { file: "7.png", width: 1309, height: 1202 },
      { file: "8.png", width: 1024, height: 1024 },
      { file: "9.png", width: 1254, height: 1254 },
      { file: "10.png", width: 1536, height: 1024 },
      { file: "11.png", width: 1122, height: 1402 },
      { file: "12.png", width: 1085, height: 1450 },
      { file: "13.png", width: 1122, height: 1402 },
      { file: "14.png", width: 1086, height: 1448 },
      { file: "15.png", width: 1089, height: 1445 },
      { file: "16.png", width: 1128, height: 1394 },
      { file: "17.png", width: 1122, height: 1402 },
      { file: "18.png", width: 1141, height: 1379 },
      { file: "19.png", width: 1310, height: 1201 },
      { file: "20.png", width: 1122, height: 1402 },
    ],
  },
  gents: {
    dir: "products/gents",
    entries: [
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
  },
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
  const { dir, entries } = MANIFEST[categorySlug];
  if (entries.length === 0) return null;

  const index = seed
    ? Math.abs(hashString(seed)) % entries.length
    : COVER_INDEX;
  const entry = entries[index];

  return {
    src: buildSrc(dir, entry.file),
    width: entry.width,
    height: entry.height,
  };
}

/** Returns the full gallery of fallback photos for a category (used on listing/detail pages). */
export function getFallbackGalleryForCategory(categorySlug: string): FallbackImage[] {
  if (!isFallbackCategorySlug(categorySlug)) return [];
  const { dir, entries } = MANIFEST[categorySlug];
  return entries.map((entry) => ({
    src: buildSrc(dir, entry.file),
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
