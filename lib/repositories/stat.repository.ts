import { prisma } from "@/lib/prisma";
import type { StatCreateInput, StatUpdateInput } from "@/lib/validators/stat";

export function findAllStats() {
  return prisma.stat.findMany({ orderBy: { order: "asc" } });
}

export function findStatById(id: string) {
  return prisma.stat.findUnique({ where: { id } });
}

export function createStat(data: StatCreateInput) {
  return prisma.stat.create({ data });
}

export function updateStat(id: string, data: StatUpdateInput) {
  return prisma.stat.update({ where: { id }, data });
}

export function deleteStat(id: string) {
  return prisma.stat.delete({ where: { id } });
}

/**
 * Swaps the `order` field between two stats — the same manual "Move Up/Down"
 * reorder UX as production steps. Both rows are looked up first, then updated
 * inside a transaction so the swap is atomic.
 */
export async function swapStatOrder(firstId: string, secondId: string) {
  const [first, second] = await Promise.all([
    prisma.stat.findUnique({ where: { id: firstId } }),
    prisma.stat.findUnique({ where: { id: secondId } }),
  ]);

  if (!first || !second) {
    return null;
  }

  const [updatedFirst, updatedSecond] = await prisma.$transaction([
    prisma.stat.update({ where: { id: first.id }, data: { order: second.order } }),
    prisma.stat.update({ where: { id: second.id }, data: { order: first.order } }),
  ]);

  return [updatedFirst, updatedSecond] as const;
}
