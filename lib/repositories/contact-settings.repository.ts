import { prisma } from "@/lib/prisma";
import type { ContactSettingsUpdateInput } from "@/lib/validators/contact-settings";

const CONTACT_SETTINGS_ID = 1;

export function findContactSettings() {
  return prisma.contactSettings.findUnique({ where: { id: CONTACT_SETTINGS_ID } });
}

/** Upserts the single contact settings row (id is always 1). */
export function upsertContactSettings(data: ContactSettingsUpdateInput) {
  return prisma.contactSettings.upsert({
    where: { id: CONTACT_SETTINGS_ID },
    create: { id: CONTACT_SETTINGS_ID, ...data },
    update: data,
  });
}
