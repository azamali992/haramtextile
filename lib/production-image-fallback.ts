/**
 * Per-step local fallback photos for production steps whose DB `imageUrl` is
 * still a legacy placeholder (see `isPlaceholderImageUrl`). Slugs match the
 * seeded step slugs from extracted-data/site-content.json.
 */
const PRODUCTION_IMAGE_BY_SLUG: Record<string, string> = {
  knitting: "/images/production/knitting.jpg",
  dyeing: "/images/production/dyeing.jpg",
  cutting: "/images/production/cutting.jpg",
  printing: "/images/production/printing.jpg",
  embroidery: "/images/production/embroidery.jpg",
  sewing: "/images/production/sewing.jpg",
  packing: "/images/production/packing.jpg",
};

const PRODUCTION_IMAGE_DEFAULT = "/images/hero/hero-factory.jpg";

/** Local photo for a production step slug, with a factory-wide default. */
export function getFallbackImageForProductionStep(slug: string): string {
  return PRODUCTION_IMAGE_BY_SLUG[slug] ?? PRODUCTION_IMAGE_DEFAULT;
}
