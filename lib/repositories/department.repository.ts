import { prisma } from "@/lib/prisma";
import type {
  DepartmentCreateInput,
  DepartmentUpdateInput,
} from "@/lib/validators/department";

export function findAllDepartments() {
  return prisma.department.findMany({ orderBy: { order: "asc" } });
}

/** Departments in order, each with its members (ordered) - for the public tabs. */
export function findDepartmentsWithMembers() {
  return prisma.department.findMany({
    orderBy: { order: "asc" },
    include: { members: { orderBy: { order: "asc" } } },
  });
}

export function findDepartmentById(id: string) {
  return prisma.department.findUnique({ where: { id } });
}

export function createDepartment(data: DepartmentCreateInput) {
  return prisma.department.create({ data });
}

export function updateDepartment(id: string, data: DepartmentUpdateInput) {
  return prisma.department.update({ where: { id }, data });
}

export function deleteDepartment(id: string) {
  // Members' departmentId is set to NULL by the FK (onDelete: SetNull).
  return prisma.department.delete({ where: { id } });
}

/** Atomic order-swap between two departments (Move Up/Down UX). */
export async function swapDepartmentOrder(firstId: string, secondId: string) {
  const [first, second] = await Promise.all([
    prisma.department.findUnique({ where: { id: firstId } }),
    prisma.department.findUnique({ where: { id: secondId } }),
  ]);

  if (!first || !second) {
    return null;
  }

  const [updatedFirst, updatedSecond] = await prisma.$transaction([
    prisma.department.update({ where: { id: first.id }, data: { order: second.order } }),
    prisma.department.update({ where: { id: second.id }, data: { order: first.order } }),
  ]);

  return [updatedFirst, updatedSecond] as const;
}
