import { prisma } from "@/lib/prisma";
import type { HeroUpdateInput } from "@/lib/validators/hero";

const HERO_ID = 1;

export function findHeroConfig() {
  return prisma.heroConfig.findUnique({ where: { id: HERO_ID } });
}

/** Upserts the single hero config row (id is always 1). */
export function upsertHeroConfig(data: HeroUpdateInput) {
  return prisma.heroConfig.upsert({
    where: { id: HERO_ID },
    create: { id: HERO_ID, ...data },
    update: data,
  });
}
