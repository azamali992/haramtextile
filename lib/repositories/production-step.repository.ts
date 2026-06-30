import { prisma } from "@/lib/prisma";
import type {
  ProductionStepCreateInput,
  ProductionStepUpdateInput,
} from "@/lib/validators/production-step";

export function findAllProductionSteps() {
  return prisma.productionStep.findMany({ orderBy: { order: "asc" } });
}

export function findProductionStepById(id: string) {
  return prisma.productionStep.findUnique({ where: { id } });
}

export function findProductionStepBySlug(slug: string) {
  return prisma.productionStep.findUnique({ where: { slug } });
}

export function createProductionStep(data: ProductionStepCreateInput) {
  return prisma.productionStep.create({ data });
}

export function updateProductionStep(id: string, data: ProductionStepUpdateInput) {
  return prisma.productionStep.update({ where: { id }, data });
}

export function deleteProductionStep(id: string) {
  return prisma.productionStep.delete({ where: { id } });
}

/**
 * Swaps the `order` field between two production steps. This is the only
 * model with a manual-reorder admin UX (no drag-and-drop library exists
 * anywhere in this codebase), so "Move Up/Down" simply swaps `order`
 * values between adjacent rows. Both rows are looked up first, then both
 * updated inside a transaction so the swap is atomic and never leaves the
 * list in a half-swapped state.
 */
export async function swapProductionStepOrder(firstId: string, secondId: string) {
  const [first, second] = await Promise.all([
    prisma.productionStep.findUnique({ where: { id: firstId } }),
    prisma.productionStep.findUnique({ where: { id: secondId } }),
  ]);

  if (!first || !second) {
    return null;
  }

  const [updatedFirst, updatedSecond] = await prisma.$transaction([
    prisma.productionStep.update({ where: { id: first.id }, data: { order: second.order } }),
    prisma.productionStep.update({ where: { id: second.id }, data: { order: first.order } }),
  ]);

  return [updatedFirst, updatedSecond] as const;
}
