/**
 * One-off content-correction script - fixes rows that were seeded before
 * the 2026-07-06 brand-questionnaire update and are NOT touched by
 * `prisma/seed.ts` on re-run (its upserts use `update: {}` so they never
 * overwrite existing rows). Safe to re-run (idempotent) against any
 * environment that already ran the seed.
 *
 * Local:      npx tsx prisma/update-content.ts
 * Production: DATABASE_URL="<neon-url>" npx tsx prisma/update-content.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { siteContent } from "../lib/site-content";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // AboutContent.storyText was seeded verbatim from the old about.intro;
  // missionText held a composed "Mission: X. Vision: Y. Values: Z." string
  // that is no longer rendered (superseded by the shared MissionVisionValues
  // section) - clear it so it doesn't show stale duplicate copy if it's
  // ever surfaced again.
  const about = await prisma.aboutContent.findUnique({ where: { id: 1 } });
  if (about) {
    await prisma.aboutContent.update({
      where: { id: 1 },
      data: {
        storyText: siteContent.about.intro,
        missionText: null,
      },
    });
    console.log("[update-content] AboutContent(id=1) storyText updated, missionText cleared.");
  } else {
    console.log("[update-content] No AboutContent row found - skipped (run db:seed first).");
  }

  // ProductionStep "packing" - description + statValue were seeded with the
  // old 600,000 pcs/month figure; the client's updated figure is 70,000.
  const packing = await prisma.productionStep.findUnique({ where: { slug: "packing" } });
  if (packing) {
    const newDescription = siteContent.manufacturing.find((m) => m.slug === "packing")?.description;
    await prisma.productionStep.update({
      where: { slug: "packing" },
      data: {
        ...(newDescription ? { description: newDescription } : {}),
        statValue: "70,000+ pcs/month",
      },
    });
    console.log("[update-content] ProductionStep(packing) description + statValue updated.");
  } else {
    console.log("[update-content] No ProductionStep(packing) row found - skipped.");
  }

  console.log("[update-content] Done.");
}

main()
  .catch((error) => {
    console.error("[update-content] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
