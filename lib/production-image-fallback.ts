/**
 * Per-step local fallback photos for production steps whose DB `imageUrl` is
 * still a legacy placeholder (see `isPlaceholderImageUrl`). Slugs match the
 * seeded step slugs from extracted-data/site-content.json.
 */
const PRODUCTION_IMAGE_BY_SLUG: Record<string, string> = {
  knitting: "/images/production/knitting.jpg",
  dyeing: "/images/production/dyeing.jpg",
  // cutting/printing/sewing/packing are large (2-8MB) camera-quality photos,
  // hosted on Cloudinary instead of committed to git (see
  // prisma/upload-production-images.ts).
  cutting: "https://res.cloudinary.com/ds08efkdx/image/upload/f_auto,q_auto,w_auto/haram-textile/production/cutting",
  printing: "https://res.cloudinary.com/ds08efkdx/image/upload/f_auto,q_auto,w_auto/haram-textile/production/printing",
  embroidery: "/images/production/embroidery.jpg",
  sewing: "https://res.cloudinary.com/ds08efkdx/image/upload/f_auto,q_auto,w_auto/haram-textile/production/sewing",
  packing: "https://res.cloudinary.com/ds08efkdx/image/upload/f_auto,q_auto,w_auto/haram-textile/production/packing",
};

const PRODUCTION_IMAGE_DEFAULT = "/images/hero/hero-factory.jpg";

/** Local photo for a production step slug, with a factory-wide default. */
export function getFallbackImageForProductionStep(slug: string): string {
  return PRODUCTION_IMAGE_BY_SLUG[slug] ?? PRODUCTION_IMAGE_DEFAULT;
}
