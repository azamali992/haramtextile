import { prisma } from "@/lib/prisma";
import type { ContactSubmissionInput } from "@/lib/validators/contact";

export function createContactSubmission(data: ContactSubmissionInput) {
  return prisma.contactSubmission.create({ data });
}

export function findAllContactSubmissions() {
  return prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" } });
}

export function findContactSubmissionById(id: string) {
  return prisma.contactSubmission.findUnique({ where: { id } });
}

export function updateContactSubmissionReadState(id: string, isRead: boolean) {
  return prisma.contactSubmission.update({ where: { id }, data: { isRead } });
}
