import { prisma } from "@/lib/prisma";
import type {
  TeamMemberCreateInput,
  TeamMemberUpdateInput,
} from "@/lib/validators/team-member";

export function findAllTeamMembers() {
  return prisma.teamMember.findMany({ orderBy: { order: "asc" } });
}

export function findTeamMemberById(id: string) {
  return prisma.teamMember.findUnique({ where: { id } });
}

export function createTeamMember(data: TeamMemberCreateInput) {
  return prisma.teamMember.create({ data });
}

export function updateTeamMember(id: string, data: TeamMemberUpdateInput) {
  return prisma.teamMember.update({ where: { id }, data });
}

export function deleteTeamMember(id: string) {
  return prisma.teamMember.delete({ where: { id } });
}

/**
 * Swaps the `order` field between two team members — the same manual
 * "Move Up/Down" reorder UX as production steps. Both rows are looked up
 * first, then updated inside a transaction so the swap is atomic.
 */
export async function swapTeamMemberOrder(firstId: string, secondId: string) {
  const [first, second] = await Promise.all([
    prisma.teamMember.findUnique({ where: { id: firstId } }),
    prisma.teamMember.findUnique({ where: { id: secondId } }),
  ]);

  if (!first || !second) {
    return null;
  }

  const [updatedFirst, updatedSecond] = await prisma.$transaction([
    prisma.teamMember.update({ where: { id: first.id }, data: { order: second.order } }),
    prisma.teamMember.update({ where: { id: second.id }, data: { order: first.order } }),
  ]);

  return [updatedFirst, updatedSecond] as const;
}
