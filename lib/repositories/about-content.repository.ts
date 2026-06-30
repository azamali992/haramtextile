import { prisma } from "@/lib/prisma";
import type { AboutContentUpdateInput } from "@/lib/validators/about-content";

const ABOUT_CONTENT_ID = 1;

export function findAboutContent() {
  return prisma.aboutContent.findUnique({ where: { id: ABOUT_CONTENT_ID } });
}

/** Upserts the single about-content row (id is always 1). */
export function upsertAboutContent(data: AboutContentUpdateInput) {
  return prisma.aboutContent.upsert({
    where: { id: ABOUT_CONTENT_ID },
    create: { id: ABOUT_CONTENT_ID, ...data },
    update: data,
  });
}
