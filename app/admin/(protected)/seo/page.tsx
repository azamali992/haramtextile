import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { SeoSettingsFormClient } from "./SeoSettingsFormClient";

export const dynamic = "force-dynamic";

export default async function AdminSeoSettingsPage() {
  const settings = await getSeoSettings();

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl text-brown-deep">SEO settings</h1>
      <SeoSettingsFormClient initialSettings={settings} />
    </div>
  );
}
