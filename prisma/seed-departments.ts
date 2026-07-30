/**
 * Seeds three starter departments and assigns any unassigned team members to
 * the first one, so the About-page team tabs render out of the box. Names are
 * sensible defaults - the client renames/reassigns from the admin panel.
 *
 * Idempotent: if departments already exist it leaves them alone.
 *
 * Run: npx tsx prisma/seed-departments.ts
 */
import "dotenv/config";
import { config as loadEnvLocal } from "dotenv";
loadEnvLocal({ path: ".env.local", override: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const STARTER_DEPARTMENTS = ["Management", "Export & Marketing", "Production"];

async function main() {
  const existing = await prisma.department.count();
  if (existing > 0) {
    console.log(`[seed-departments] ${existing} department(s) already exist - skipping creation.`);
  } else {
    await prisma.department.createMany({
      data: STARTER_DEPARTMENTS.map((name, order) => ({ name, order })),
    });
    console.log(`[seed-departments] created: ${STARTER_DEPARTMENTS.join(", ")}`);
  }

  // Assign any unassigned team members to the first department so the tabs
  // aren't all empty.
  const first = await prisma.department.findFirst({ orderBy: { order: "asc" } });
  if (first) {
    const res = await prisma.teamMember.updateMany({
      where: { departmentId: null },
      data: { departmentId: first.id },
    });
    console.log(`[seed-departments] assigned ${res.count} unassigned member(s) to "${first.name}".`);
  }

  const depts = await prisma.department.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { members: true } } },
  });
  console.log(
    "[seed-departments] now:",
    depts.map((d) => `${d.name} (${d._count.members})`).join(", "),
  );
}

main()
  .catch((e) => {
    console.error("[seed-departments] Failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
