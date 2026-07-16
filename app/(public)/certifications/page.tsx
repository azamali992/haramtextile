import type { Metadata } from "next";
import { listCertifications } from "@/lib/services/certification.service";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import { buildMetadata, buildItemListSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { isPlaceholderImageUrl } from "@/lib/product-image-fallback";
import { getFallbackImageForProductionStep } from "@/lib/production-image-fallback";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { CertificationsGrid } from "@/components/sections/CertificationsGrid";
import { PhotoHero } from "@/components/sections/PhotoHero";
import { PullQuote } from "@/components/sections/PullQuote";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings().catch(() => null);

  return buildMetadata(
    {
      title: "Certifications",
      description: siteContent.certifications.intro,
      path: "/certifications",
    },
    {
      siteTitleSuffix: seoSettings?.siteTitleSuffix,
      siteUrl: config.NEXT_PUBLIC_SITE_URL,
    },
  );
}

const CERTIFICATIONS_FAQS = [
  {
    question: "How long are Haram Textile's certifications valid?",
    answer:
      "Each certification is maintained on the issuing body's standard renewal cycle and re-audited periodically to stay current. Contact us for the latest validity dates and audit reports for a specific certificate.",
  },
  {
    question: "Does Haram Textile undergo independent compliance audits?",
    answer: `Yes. ${siteContent.certifications.intro}`,
  },
  {
    question: "Which certifications does Haram Textile hold?",
    answer: `Haram Textile holds ${siteContent.certifications.list.join(", ")}.`,
  },
];

export default async function CertificationsPage() {
  const certifications = await listCertifications();
  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const itemListSchema = buildItemListSchema(
    certifications.map((certification) => ({
      name: certification.name,
      url: `${baseUrl}/certifications/${certification.id}`,
      imageUrl: isPlaceholderImageUrl(certification.imageUrl) ? undefined : certification.imageUrl,
    })),
  );

  /** Resolve image server-side */
  const certItems = certifications.map((cert) => {
    const usableImage = !isPlaceholderImageUrl(cert.imageUrl);
    const image = usableImage
      ? { src: cert.imageUrl, width: 900, height: 1200 }
      : { src: "/images/certifications/certification-badge.jpg", width: 900, height: 1200 };
    return {
      id: cert.id,
      name: cert.name,
      issuingBody: cert.issuingBody,
      description: cert.description,
      image,
      pdfUrl: cert.pdfUrl,
    };
  });

  return (
    <main>
      <Breadcrumb
        items={[
          { name: "Home", url: baseUrl, href: "/" },
          { name: "Certifications", url: `${baseUrl}/certifications` },
        ]}
      />

      {/* Photo hero - the visible page opener */}
      <div className="px-2 sm:px-3">
        <PhotoHero
          eyebrow="Quality assurance"
          title="Audited to global standards"
          subtitle={siteContent.certifications.intro}
          imageSrc={getFallbackImageForProductionStep("packing")}
          imageAlt="Quality inspection and finishing at Haram Textile, Faisalabad"
          as="p"
        />
      </div>

      {/* h1 for screen readers and SEO */}
      <h1 className="sr-only">Our Certifications</h1>

      {/* Certifications grid */}
      <section
        aria-labelledby="certifications-grid-heading"
        className="px-6 py-24 sm:px-10 sm:py-32"
      >
        <div className="mx-auto max-w-[90rem]">
          <SectionHeader
            eyebrow="What we hold"
            eyebrowTone="dark"
            title={["Our certifications"]}
            body={
              certifications.length > 0
                ? `Independently audited and renewed on each issuing body's cycle — ${certifications.map((c) => c.name).join(", ")}.`
                : "Independently audited and renewed on each issuing body's cycle."
            }
            titleClassName="text-display text-[var(--ink)]"
            bodyClassName="text-[var(--ink-soft)] max-w-2xl text-body"
            className="mb-14"
          />
        </div>

        <h2 id="certifications-grid-heading" className="sr-only">
          All Certifications
        </h2>

        {certifications.length === 0 ? (
          <div className="mx-auto max-w-[90rem]">
            <p className="font-body text-base text-[var(--ink-soft)]">
              Certification details are being updated.
            </p>
          </div>
        ) : (
          <CertificationsGrid certifications={certItems} />
        )}
      </section>

      {/* Pull quote - full-bleed dark photo band with the cert chips */}
      <PullQuote
        quote={siteContent.site.quote}
        attribution={`Haram Textile - ${siteContent.contact.address.split(",").slice(-2).join(",").trim()}`}
        certBadges={certifications.map((c) => ({
          name: c.name,
          issuingBody: c.issuingBody ?? null,
        }))}
        photoBackground="/images/about/about-factory.jpg"
      />

      <FaqAccordion faqs={CERTIFICATIONS_FAQS} title="Validity, Audits & Compliance FAQs" />

      <JsonLd data={itemListSchema} />
    </main>
  );
}
