import { prisma } from "@/lib/prisma";

export function findAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function findCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export function findCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}
