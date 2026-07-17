import * as contactSettingsRepository from "@/lib/repositories/contact-settings.repository";
import type { ContactSettingsUpdateInput } from "@/lib/validators/contact-settings";

export function getContactSettings() {
  return contactSettingsRepository.findContactSettings();
}

export function saveContactSettings(data: ContactSettingsUpdateInput) {
  return contactSettingsRepository.upsertContactSettings(data);
}
