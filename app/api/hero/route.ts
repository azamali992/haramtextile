import { ok, notFound, internalError } from "@/lib/api-response";
import { logger, newRequestId } from "@/lib/logger";
import { getHeroConfig } from "@/lib/services/hero.service";

// DB-backed and admin-editable — never statically cache at build time.
export const dynamic = "force-dynamic";

/** Strips internal-only fields (e.g. the Cloudinary `imagePublicId`) before sending to a public client. */
function toPublicHero(hero: Awaited<ReturnType<typeof getHeroConfig>>) {
  if (!hero) return hero;
  return {
    headline: hero.headline,
    subtext: hero.subtext,
    ctaText: hero.ctaText,
    ctaLink: hero.ctaLink,
    imageUrl: hero.imageUrl,
    updatedAt: hero.updatedAt,
  };
}

/** GET /api/hero — public lookup of the current hero section config. */
export async function GET() {
  const requestId = newRequestId();
  try {
    const hero = await getHeroConfig();

    if (!hero) {
      return notFound("Hero configuration has not been set up yet.");
    }

    return ok(toPublicHero(hero));
  } catch (error) {
    logger.error(requestId, "hero_get_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return internalError();
  }
}
