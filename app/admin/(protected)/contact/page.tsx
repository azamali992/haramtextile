import { getContactSettings } from "@/lib/services/contact-settings.service";
import { siteContent } from "@/lib/site-content";
import { ContactSettingsFormClient } from "./ContactSettingsFormClient";

export const dynamic = "force-dynamic";

export default async function AdminContactSettingsPage() {
  const settings = await getContactSettings();

  return (
    <div>
      <h1 className="mb-2 font-heading text-xl text-brown-deep">Contact details</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-warm">
        These values drive the public Contact page and the site footer. Until you
        save for the first time, the site falls back to the built-in defaults.
      </p>
      <ContactSettingsFormClient
        initialSettings={
          settings
            ? {
                phone: settings.phone,
                address: settings.address,
                mapLink: settings.mapLink,
                hours: settings.hours,
                emails: settings.emails,
              }
            : null
        }
        fallback={siteContent.contact}
      />
    </div>
  );
}
