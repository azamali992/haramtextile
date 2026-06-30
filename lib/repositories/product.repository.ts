import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { ProductCreateInput, ProductUpdateInput } from "@/lib/validators/product";

export interface ProductListFilters {
  categorySlug?: string;
  search?: string;
}

function buildWhere(filters: ProductListFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { tags: { has: filters.search } },
    ];
  }

  return where;
}

export function findManyProducts(filters: ProductListFilters) {
  return prisma.product.findMany({
    where: buildWhere(filters),
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export function countProducts(filters: ProductListFilters) {
  return prisma.product.count({ where: buildWhere(filters) });
}

export function findProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
}

export function createProduct(data: ProductCreateInput) {
  return prisma.product.create({
    data: {
      ...data,
      tags: data.tags ?? [],
    },
    include: { category: true },
  });
}

export function updateProduct(id: string, data: ProductUpdateInput) {
  return prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });
}

export function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}
