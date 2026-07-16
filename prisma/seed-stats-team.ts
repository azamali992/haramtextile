/**
 * One-off / idempotent: seed the Stat and TeamMember tables from the current
 * static siteContent values, so the admin panel starts populated and the
 * public site (which now reads from these tables with a static fallback)
 * shows the same figures. Skips a table if it already has rows.
 *
 * Run: npx tsx -r dotenv/config prisma/seed-stats-team.ts dotenv_config_path=.env.local
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { config } from "../lib/config";
import siteContent from "../extracted-data/site-content.json";

async function main() {
  const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const statCount = await prisma.stat.count();
  if (statCount === 0) {
    await prisma.stat.createMany({
      data: siteContent.stats.map((s, i) => ({ label: s.label, value: s.value, order: i })),
    });
    console.log(`[stats] seeded ${siteContent.stats.length}`);
  } else {
    console.log(`[stats] skipped — ${statCount} already present`);
  }

  const teamCount = await prisma.teamMember.count();
  if (teamCount === 0) {
    await prisma.teamMember.createMany({
      data: siteContent.team.map((m, i) => ({
        name: m.name,
        role: m.role,
        email: m.email,
        order: i,
      })),
    });
    console.log(`[team] seeded ${siteContent.team.length}`);
  } else {
    console.log(`[team] skipped — ${teamCount} already present`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("[seed-stats-team] Failed:", e);
  process.exit(1);
});
