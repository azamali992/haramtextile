import { prisma } from "@/lib/prisma";
import type {
  CertificationCreateInput,
  CertificationUpdateInput,
} from "@/lib/validators/certification";

export function findAllCertifications() {
  return prisma.certification.findMany({ orderBy: { createdAt: "desc" } });
}

export function findCertificationById(id: string) {
  return prisma.certification.findUnique({ where: { id } });
}

export function createCertification(data: CertificationCreateInput) {
  return prisma.certification.create({ data });
}

export function updateCertification(id: string, data: CertificationUpdateInput) {
  return prisma.certification.update({ where: { id }, data });
}

export function deleteCertification(id: string) {
  return prisma.certification.delete({ where: { id } });
}
