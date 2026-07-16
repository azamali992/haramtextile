import type { Metadata } from "next";
import { getAboutContent } from "@/lib/services/about-content.service";
import { listStats } from "@/lib/services/stat.service";
import { listTeamMembers } from "@/lib/services/team-member.service";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { config } from "@/lib/config";
import { siteContent, resolveStats, resolveTeam } from "@/lib/site-content";
import { buildMetadata, buildAboutPageSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AboutHero } from "@/components/sections/AboutHero";
import { StatBand } from "@/components/sections/StatBand";
import { PullQuote } from "@/components/sections/PullQuote";
import { AboutSections } from "@/components/sections/AboutSections";
import { MissionVisionValues } from "@/components/sections/MissionVisionValues";

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
    answer: `Our core values are ${siteContent.about.values.map((v) => v.name).join(", ")}.`,
  },
];

/** Format stats for StatBand - abbreviate large numbers */
function formatStatValue(value: number): string {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M+`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K+`;
  return value.toLocaleString();
}

export default async function AboutPage() {
  const [aboutContent, dbStats, dbTeam] = await Promise.all([
    getAboutContent(),
    listStats(),
    listTeamMembers(),
  ]);

  const baseUrl = config.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const aboutPageSchema = buildAboutPageSchema({
    name: `About ${siteContent.site.name}`,
    description: siteContent.about.intro,
    url: `${baseUrl}/about`,
  });

  const faqSchema = ABOUT_FAQS;

  // Stats + team: DB rows (admin-editable) with static fallback.
  const resolvedStats = resolveStats(dbStats);
  const resolvedTeam = resolveTeam(dbTeam);

  // `layout="row"` renders exactly 4 equal columns (see StatBand.tsx), so
  // take the first 4 resolved stats in admin order.
  const statItems = resolvedStats.slice(0, 4).map((s) => ({
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

      {/* Hero - photo band + two-column story */}
      <AboutHero
        storyText={aboutContent?.storyText ?? siteContent.about.intro}
        imageUrl={
          aboutContent?.imageUrl &&
          !aboutContent.imageUrl.includes("haramtextile.com")
            ? aboutContent.imageUrl
            : "/images/about/about-factory.jpg"
        }
      />

      {/* Stats band - numbered row, straight after the story */}
      <StatBand
        eyebrow="By the numbers"
        title={["Haram Textile", "at scale"]}
        stats={statItems}
        tone="cream"
        layout="row"
        className="mx-2 sm:mx-3"
      />

      {/* Mission, Vision & Values - shared with Home */}
      <MissionVisionValues
        mission={siteContent.about.mission}
        vision={siteContent.about.vision}
        values={siteContent.about.values}
        tone="background"
      />

      {/* Pull quote - full-bleed dark photo band, this page's one dark moment */}
      <PullQuote
        quote={siteContent.site.quote}
        attribution={`${resolvedTeam[0]?.name ?? "Rashid Mehmood"}, CEO - ${siteContent.site.name}`}
        photoBackground="/images/about/about-factory.jpg"
      />

      {/* About content sections - USP, why pakistan, team */}
      <AboutSections
        whyPakistan={siteContent.about.whyPakistan}
        usp={siteContent.about.usp}
        team={resolvedTeam}
      />

      <FaqAccordion faqs={faqSchema} title="Company History & Export Experience FAQs" />

      <JsonLd data={aboutPageSchema} />
    </main>
  );
}
