import { prisma } from "@/lib/prisma";
import type {
  ProductionStepCreateInput,
  ProductionStepUpdateInput,
} from "@/lib/validators/production-step";

const GALLERY_INCLUDE = {
  galleryImages: { orderBy: { order: "asc" as const } },
};

export function findAllProductionSteps() {
  return prisma.productionStep.findMany({
    orderBy: { order: "asc" },
    include: GALLERY_INCLUDE,
  });
}

export function findProductionStepById(id: string) {
  return prisma.productionStep.findUnique({ where: { id }, include: GALLERY_INCLUDE });
}

export function findProductionStepBySlug(slug: string) {
  return prisma.productionStep.findUnique({ where: { slug }, include: GALLERY_INCLUDE });
}

export function addProductionStepImage(
  productionStepId: string,
  data: { imageUrl: string; imagePublicId: string; order: number },
) {
  return prisma.productionStepImage.create({ data: { productionStepId, ...data } });
}

export function findProductionStepImageById(id: string) {
  return prisma.productionStepImage.findUnique({ where: { id } });
}

export function deleteProductionStepImage(id: string) {
  return prisma.productionStepImage.delete({ where: { id } });
}

export function countProductionStepImages(productionStepId: string) {
  return prisma.productionStepImage.count({ where: { productionStepId } });
}

export function createProductionStep(data: ProductionStepCreateInput) {
  return prisma.productionStep.create({ data, include: GALLERY_INCLUDE });
}

export function updateProductionStep(id: string, data: ProductionStepUpdateInput) {
  return prisma.productionStep.update({ where: { id }, data, include: GALLERY_INCLUDE });
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
    prisma.productionStep.update({
      where: { id: first.id },
      data: { order: second.order },
      include: GALLERY_INCLUDE,
    }),
    prisma.productionStep.update({
      where: { id: second.id },
      data: { order: first.order },
      include: GALLERY_INCLUDE,
    }),
  ]);

  return [updatedFirst, updatedSecond] as const;
}
