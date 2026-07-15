import type { Metadata } from "next";
import Link from "next/link";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import { buildMetadata, buildFaqSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PhotoHero } from "@/components/sections/PhotoHero";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { SustainabilityGoals } from "@/components/sections/SustainabilityGoals";

export const dynamic = "force-dynamic";

const SUSTAINABILITY_DESCRIPTION =
  "How Haram Textile manufactures responsibly: BSCI social compliance, OEKO-TEX Standard 100 fabric safety, and ISO 9001 quality, mapped to the UN Sustainable Development Goals for apparel manufacturing.";

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings().catch(() => null);

  return buildMetadata(
    {
      title: "Sustainability",
      description: SUSTAINABILITY_DESCRIPTION,
      path: "/sustainability",
    },
    {
      siteTitleSuffix: seoSettings?.siteTitleSuffix,
      siteUrl: config.NEXT_PUBLIC_SITE_URL,
    },
  );
}

const SUSTAINABILITY_FAQS = [
  {
    question: "Is Haram Textile socially compliant?",
    answer:
      "Yes. We are BSCI certified (an independently audited standard for safe and fair working conditions), and we also hold OEKO-TEX Standard 100 and ISO 9001:2008 certifications.",
  },
  {
    question: "Which UN Sustainable Development Goals does Haram Textile support?",
    answer:
      "Our manufacturing most directly supports SDG 6 (Clean Water & Sanitation), SDG 8 (Decent Work & Economic Growth), SDG 12 (Responsible Consumption & Production), SDG 3 (Good Health & Well-being), SDG 5 (Gender Equality), and SDG 13 (Climate Action).",
  },
  {
    question: "Are Haram Textile's fabrics tested for harmful substances?",
    answer:
      "Yes. Our OEKO-TEX Standard 100 certification (AITEX, Spain, Class II) verifies that our textiles are tested against a regulated list of harmful substances, protecting both our workers and the people who wear our garments.",
  },
  {
    question: "How does Haram Textile manage water use in dyeing?",
    answer:
      "Dyeing and finishing are the most water-intensive stages of knitwear production. Because these run in-house at our Faisalabad facility, we manage water use directly and are committed to responsible effluent handling.",
  },
];

export default function SustainabilityPage() {
  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const faqSchema = buildFaqSchema(SUSTAINABILITY_FAQS);

  return (
    <main>
      <Breadcrumb
        items={[
          { name: "Home", url: baseUrl, href: "/" },
          { name: "Sustainability", url: `${baseUrl}/sustainability` },
        ]}
      />

      {/* Photo hero - the visible page opener */}
      <div className="px-2 sm:px-3">
        <PhotoHero
          eyebrow="Responsibility"
          title="Sustainability in every stitch"
          subtitle="We assume responsibility for the social, ecological, and economic impact of everything we make."
          imageSrc="/images/hero/hero-factory.jpg"
          imageAlt="Haram Textile production floor in Faisalabad, Pakistan"
          as="p"
        />
      </div>

      {/* h1 for screen readers and SEO */}
      <h1 className="sr-only">Sustainability at Haram Textile</h1>

      {/* Commitment statement */}
      <section
        aria-labelledby="commitment-heading"
        className="px-6 py-24 sm:px-10 sm:py-32"
      >
        <div className="mx-auto grid max-w-[90rem] gap-x-16 gap-y-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeader
            eyebrow="Our commitment"
            title={["We take responsibility", "for how we make"]}
            titleClassName="text-title sm:text-display text-[var(--ink)]"
          />
          <div className="max-w-2xl">
            <p className="font-body text-body-lg leading-relaxed text-[var(--ink)]">
              {siteContent.home.socialCompliance}
            </p>
            <p className="mt-6 font-body text-body leading-relaxed text-[var(--ink-soft)]">
              We align that commitment with the United Nations Sustainable
              Development Goals, the shared global framework for responsible
              business. Below are the goals our manufacturing supports most
              directly, and the independent certifications that back them up.
            </p>
          </div>
        </div>
      </section>

      {/* SDG goals grid */}
      <section
        aria-labelledby="goals-heading"
        className="bg-[var(--surface)] px-6 py-24 sm:px-10 sm:py-32"
      >
        <div className="mx-auto max-w-[90rem]">
          <SectionHeader
            eyebrow="The 2030 agenda"
            title={["The goals we", "build toward"]}
            titleClassName="text-title sm:text-display text-[var(--ink)]"
            className="mb-14 max-w-2xl"
          />
          <h2 id="goals-heading" className="sr-only">
            UN Sustainable Development Goals we support
          </h2>
          <SustainabilityGoals />
        </div>
      </section>

      {/* Certifications that back the commitment */}
      <section
        aria-labelledby="audited-heading"
        className="px-6 py-24 sm:px-10 sm:py-32"
      >
        <div className="mx-auto max-w-[90rem]">
          <SectionHeader
            eyebrow="Independently audited"
            title={["Commitments, verified", "by third parties"]}
            titleClassName="text-title sm:text-display text-[var(--ink)]"
            className="max-w-2xl"
          />
          <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-3">
            {siteContent.certifications.list.map((cert) => (
              <li
                key={cert}
                className="bg-[var(--surface-card)] p-7 font-heading text-title-sm font-normal text-[var(--ink)]"
              >
                {cert}
              </li>
            ))}
          </ul>
          <p className="mt-8 font-body text-body text-[var(--ink-soft)]">
            See the full list and issuing bodies on our{" "}
            <Link
              href="/certifications"
              className="text-[var(--brand-strong)] underline underline-offset-4 transition-colors hover:text-[var(--brand-deep)]"
            >
              certifications page
            </Link>
            .
          </p>
        </div>
      </section>

      <FaqAccordion faqs={SUSTAINABILITY_FAQS} title="Sustainability FAQs" />

      <JsonLd data={faqSchema} />
    </main>
  );
}
