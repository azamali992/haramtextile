import { prisma } from "@/lib/prisma";
import type { ClientLogoCreateInput } from "@/lib/validators/client-logo";

export function findAllClientLogos() {
  return prisma.clientLogo.findMany({ orderBy: { order: "asc" } });
}

export function findClientLogoById(id: string) {
  return prisma.clientLogo.findUnique({ where: { id } });
}

export function createClientLogo(data: ClientLogoCreateInput) {
  return prisma.clientLogo.create({ data });
}

export function deleteClientLogo(id: string) {
  return prisma.clientLogo.delete({ where: { id } });
}
