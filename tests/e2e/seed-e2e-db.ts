/**
 * Standalone script (run via `tsx`, matching `prisma/seed.ts`'s pattern)
 * that resets and reseeds the E2E test database. Kept as its own script
 * rather than inline in `global-setup.ts` because Playwright's bundled TS
 * loader runs config/setup files in CJS mode, which can't import Prisma
 * 7's generated client (it's genuine ESM and uses `import.meta.url`).
 * Running this as a child process via `tsx` (same runtime `npm run
 * db:seed` already uses) sidesteps that entirely.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../lib/generated/prisma/client";

export const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "qa-admin@haramtextile.com";
export const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Qa-Test-Password-123!";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  await prisma.contactSubmission.deleteMany();
  await prisma.clientLogo.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.heroConfig.deleteMany();
  await prisma.aboutContent.deleteMany();
  await prisma.seoSettings.deleteMany();
  await prisma.adminUser.deleteMany();

  const hashedPassword = await bcrypt.hash(E2E_ADMIN_PASSWORD, 10);
  await prisma.adminUser.create({ data: { email: E2E_ADMIN_EMAIL, password: hashedPassword } });

  await prisma.category.create({ data: { name: "Gents", slug: "gents" } });

  await prisma.heroConfig.upsert({
    where: { id: 1 },
    create: { id: 1, headline: "Original Headline", ctaText: "Get in Touch", ctaLink: "/contact" },
    update: {},
  });

  await prisma.$disconnect();
  console.log("[e2e-seed] Test database reset and seeded.");
}

main().catch((error) => {
  console.error("[e2e-seed] Failed:", error);
  process.exitCode = 1;
});
