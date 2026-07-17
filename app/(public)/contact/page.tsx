import type { Metadata } from "next";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { getContactSettings } from "@/lib/services/contact-settings.service";
import { config } from "@/lib/config";
import { siteContent, resolveContact, type ResolvedContact } from "@/lib/site-content";
import { buildMetadata, buildContactPageSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
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

/** Builds the contact FAQ list from the resolved (DB-or-fallback) details. */
function buildContactFaqs(contact: ResolvedContact) {
  return [
    {
      question: "What are Haram Textile's office hours?",
      answer: contact.hours,
    },
    {
      question: "How quickly does Haram Textile respond to inquiries?",
      answer:
        "Our export and marketing team typically responds to new inquiries within one to two business days during office hours.",
    },
    {
      question: "What information should I include when requesting a quote?",
      answer:
        "Please include your target product category, approximate order quantity, preferred fabric, and destination country so our team can provide accurate pricing and lead times.",
    },
    {
      question: "Does Haram Textile export internationally?",
      answer: siteContent.home.markets,
    },
  ];
}

export default async function ContactPage() {
  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  // Contact details are admin-editable (ContactSettings), with the static
  // siteContent values as a fallback until the row is saved.
  const contact = resolveContact(await getContactSettings());
  const primaryEmail = contact.emails[0]?.email;
  const CONTACT_FAQS = buildContactFaqs(contact);

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

      <FaqAccordion faqs={CONTACT_FAQS} title="Response Time, Office Hours & Export Process FAQs" />

      <JsonLd data={contactPageSchema} />
    </main>
  );
}
