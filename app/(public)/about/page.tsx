import type { Metadata } from "next";
import { getAboutContent } from "@/lib/services/about-content.service";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import { buildMetadata, buildAboutPageSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AboutHero } from "@/components/sections/AboutHero";
import { StatBand } from "@/components/sections/StatBand";
import { PullQuote } from "@/components/sections/PullQuote";
import { ContactCTABand } from "@/components/sections/ContactCTABand";
import { AboutSections } from "@/components/sections/AboutSections";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings().catch(() => null);

  return buildMetadata(
    {
      title: "About Us",
      description: siteContent.about.intro,
      path: "/about",
    },
    {
      siteTitleSuffix: seoSettings?.siteTitleSuffix,
      siteUrl: config.NEXT_PUBLIC_SITE_URL,
    },
  );
}

const ABOUT_FAQS = [
  {
    question: "When was Haram Textile founded?",
    answer: `Haram Textile was founded on ${new Date(siteContent.site.founded).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.`,
  },
  {
    question: "Why manufacture apparel in Pakistan?",
    answer: siteContent.about.whyPakistan.join("; ") + ".",
  },
  {
    question: "What is Haram Textile's mission and vision?",
    answer: `Mission: ${siteContent.about.mission}. Vision: ${siteContent.about.vision}.`,
  },
  {
    question: "What does Haram Textile value as a company?",
    answer: `Our core values are ${siteContent.about.values.join(", ")}.`,
  },
];

/** Format stats for StatBand — abbreviate large numbers */
function formatStatValue(value: number): string {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M+`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K+`;
  return value.toLocaleString();
}

export default async function AboutPage() {
  const aboutContent = await getAboutContent();

  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const aboutPageSchema = buildAboutPageSchema({
    name: `About ${siteContent.site.name}`,
    description: siteContent.about.intro,
    url: `${baseUrl}/about`,
  });

  const faqSchema = ABOUT_FAQS;

  const statItems = siteContent.stats.map((s) => ({
    value: formatStatValue(s.value),
    label: s.label,
  }));

  return (
    <main>
      <Breadcrumb
        items={[
          { name: "Home", url: baseUrl, href: "/" },
          { name: "About", url: `${baseUrl}/about` },
        ]}
      />

      {/* Hero — editorial intro with word-by-word reveal */}
      <AboutHero
        storyText={aboutContent?.storyText ?? siteContent.about.intro}
        imageUrl={
          aboutContent?.imageUrl &&
          !aboutContent.imageUrl.includes("haramtextile.com")
            ? aboutContent.imageUrl
            : "/images/about/about-factory.jpg"
        }
        missionText={aboutContent?.missionText ?? null}
      />

      {/* About content sections — why pakistan, mission/vision/values, team */}
      <AboutSections
        whyPakistan={siteContent.about.whyPakistan}
        mission={siteContent.about.mission}
        vision={siteContent.about.vision}
        values={siteContent.about.values}
        aboutShort={siteContent.home.aboutShort}
        team={siteContent.team}
      />

      {/* Pull quote with cert badges placeholder */}
      <PullQuote
        eyebrow="Our commitment"
        title={["Trusted by", "global brands"]}
        quote={siteContent.site.quote}
        attribution={`${siteContent.team[0]?.name ?? "Rashid Mehmood"}, CEO — ${siteContent.site.name}`}
      />

      {/* Stats band */}
      <StatBand
        eyebrow="By the numbers"
        title={["Haram Textile", "at scale"]}
        stats={statItems}
        tone="green"
        className="mt-3"
      />

      {/* Contact CTA */}
      <ContactCTABand
        eyebrow="Work with us"
        title={["Ready to", "start your order?"]}
        ctaLabel="Get a Quote"
      />

      <FaqAccordion faqs={faqSchema} title="Company History & Export Experience FAQs" />

      <JsonLd data={aboutPageSchema} />
    </main>
  );
}
