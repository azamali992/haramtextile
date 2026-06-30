import { prisma } from "@/lib/prisma";
import type { SeoSettingsUpdateInput } from "@/lib/validators/seo-settings";

const SEO_SETTINGS_ID = 1;

export function findSeoSettings() {
  return prisma.seoSettings.findUnique({ where: { id: SEO_SETTINGS_ID } });
}

export function upsertSeoSettings(data: SeoSettingsUpdateInput) {
  return prisma.seoSettings.upsert({
    where: { id: SEO_SETTINGS_ID },
    create: { id: SEO_SETTINGS_ID, ...data },
    update: data,
  });
}
