import * as seoSettingsRepository from "@/lib/repositories/seo-settings.repository";
import type { SeoSettingsUpdateInput } from "@/lib/validators/seo-settings";

export function getSeoSettings() {
  return seoSettingsRepository.findSeoSettings();
}

export function saveSeoSettings(data: SeoSettingsUpdateInput) {
  return seoSettingsRepository.upsertSeoSettings(data);
}
