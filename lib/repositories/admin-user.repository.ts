import { prisma } from "@/lib/prisma";

export function findAdminById(id: string) {
  return prisma.adminUser.findUnique({ where: { id } });
}

export function updateAdminPassword(id: string, hashedPassword: string) {
  return prisma.adminUser.update({
    where: { id },
    data: { password: hashedPassword },
  });
}
