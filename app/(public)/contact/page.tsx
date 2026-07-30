import type { Metadata } from "next";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { getContactSettings } from "@/lib/services/contact-settings.service";
import { config } from "@/lib/config";
import { siteContent, resolveContact } from "@/lib/site-content";
import { buildMetadata, buildContactPageSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ContactPageClient } from "@/components/sections/ContactPageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings().catch(() => null);

  return buildMetadata(
    {
      title: "Contact Us",
      description: `Get in touch with ${siteContent.site.name}'s export team.`,
      path: "/contact",
    },
    {
      siteTitleSuffix: seoSettings?.siteTitleSuffix,
      siteUrl: config.NEXT_PUBLIC_SITE_URL,
    },
  );
}

export default async function ContactPage() {
  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  // Contact details are admin-editable (ContactSettings), with the static
  // siteContent values as a fallback until the row is saved.
  const contact = resolveContact(await getContactSettings());
  const primaryEmail = contact.emails[0]?.email;

  const contactPageSchema = buildContactPageSchema({
    name: `Contact ${siteContent.site.name}`,
    description: `Get in touch with ${siteContent.site.name}'s export team.`,
    url: `${baseUrl}/contact`,
    phone: contact.phone,
    email: primaryEmail,
  });

  return (
    <main>
      <Breadcrumb
        items={[
          { name: "Home", url: baseUrl, href: "/" },
          { name: "Contact", url: `${baseUrl}/contact` },
        ]}
      />

      <ContactPageClient
        contact={contact}
        siteName={siteContent.site.name}
      />

      <JsonLd data={contactPageSchema} />
    </main>
  );
}
