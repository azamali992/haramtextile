/**
 * Seed script — populates Category, Product (one row per legacy product
 * category, since the scraped legacy site only ever had image galleries
 * with no per-photo names/descriptions/prices/MOQs), Certification,
 * ClientLogo (17 real legacy client-logo images), ProductionStep (the
 * 7-step manufacturing pipeline), HeroConfig (id=1), AboutContent (id=1),
 * AdminUser (single admin), and SeoSettings (id=1) from
 * `extracted-data/site-content.json`.
 *
 * Run with `npm run db:seed` (also wired into `prisma db seed` via the
 * `prisma.seed` key in package.json).
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface SiteContent {
  site: {
    name: string;
    tagline: string;
    baseUrl: string;
  };
  contact: {
    emails: { label: string; email: string }[];
  };
  certifications: {
    intro: string;
    list: string[];
  };
  productCategories: {
    slug: string;
    name: string;
    intro: string;
  }[];
  home: {
    aboutShort: string;
  };
  about: {
    intro: string;
    whyPakistan: string[];
    vision: string;
    values: string[];
    mission: string;
  };
  manufacturing: { slug: string; name: string; description: string }[];
}

const SITE_CONTENT_PATH = join(__dirname, "..", "extracted-data", "site-content.json");

/**
 * Splits a legacy certification string like
 * "ISO 9001:2008 (certified by ACS)" into a clean name + issuing body.
 * Falls back to the whole string as the name with a null issuingBody when
 * no recognizable pattern is present — never invents an issuer that isn't
 * in the source text.
 */
function parseCertification(raw: string): { name: string; issuingBody: string | null } {
  const byMatch = raw.match(/^(.*?)\s*\(certified by (.+)\)$/i);
  if (byMatch) {
    return { name: byMatch[1].trim(), issuingBody: byMatch[2].trim() };
  }

  const byOrgMatch = raw.match(/^(.*?)\s+by\s+(.+)$/i);
  if (byOrgMatch) {
    return { name: byOrgMatch[1].trim(), issuingBody: byOrgMatch[2].trim() };
  }

  return { name: raw.trim(), issuingBody: null };
}

async function main() {
  const siteContent: SiteContent = JSON.parse(readFileSync(SITE_CONTENT_PATH, "utf-8"));

  // --- Categories + Products -------------------------------------------------
  // One Product row per legacy category page. The legacy site's product
  // pages were pure image galleries with no per-photo product data, so we
  // intentionally do NOT invent individual product names/prices/MOQs here.
  // `moq` and `fabricType` are left null because no MOQ or fabric-type data
  // exists anywhere in the scraped source.
  for (const category of siteContent.productCategories) {
    const categoryRecord = await prisma.category.upsert({
      where: { slug: category.slug },
      create: { name: category.name, slug: category.slug },
      update: { name: category.name },
    });

    const existingProduct = await prisma.product.findFirst({
      where: { categoryId: categoryRecord.id },
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: {
          name: category.name,
          description: category.intro,
          // Placeholder gallery cover image — the legacy site had no
          // single "hero" image per category, only numbered gallery
          // photos. Real per-product images get uploaded via the admin
          // panel (lib/storage.ts) post-launch.
          imageUrl: `${siteContent.site.baseUrl}${category.slug === "gents" ? "images/mens/1.jpg" : `images/${category.slug === "girls" ? "girl" : category.slug}/1.jpg`}`,
          imagePublicId: `placeholder/${category.slug}`,
          moq: null,
          fabricType: null,
          tags: [],
          categoryId: categoryRecord.id,
          seoTitle: category.name,
          seoDescription: category.intro,
          focusKeyword: category.name.toLowerCase(),
        },
      });
    }
  }

  // --- Certifications ----------------------------------------------------
  for (const raw of siteContent.certifications.list) {
    const { name, issuingBody } = parseCertification(raw);

    const existing = await prisma.certification.findFirst({ where: { name } });
    if (!existing) {
      await prisma.certification.create({
        data: {
          name,
          description: siteContent.certifications.intro,
          issuingBody,
          // No certification badge images were captured in the scrape
          // beyond generic site graphics (certi.jpg/bsci.jpg/quality.jpg)
          // that aren't attributable 1:1 to a specific certification, so
          // we leave these as documented placeholders for admin upload.
          imageUrl: `${siteContent.site.baseUrl}images/certi.jpg`,
          imagePublicId: "placeholder/certification",
          seoTitle: name,
          seoDescription: siteContent.certifications.intro,
        },
      });
    }
  }

  // --- Client logos --------------------------------------------------------
  // 17 real legacy client-logo images already exist at
  // public/images/clients/clogo<n>.jpg (n = 1..17), copied in ahead of this
  // seed run. `ClientLogo` has no unique/slug-like field to upsert against
  // (just a `cuid()` id), so — same as Product above — we guard with a
  // count check rather than per-row upserts, keeping re-runs idempotent.
  // No real client/brand names exist anywhere in the scrape, so per the
  // same "don't invent data that wasn't in the source" principle as the
  // Product seed above, `altText` is a plain factual string rather than
  // invented per-logo company names. imagePublicId uses the same
  // "local/<label>-<n>" non-Cloudinary convention as ProductionStep below.
  const existingClientLogoCount = await prisma.clientLogo.count();
  if (existingClientLogoCount === 0) {
    const CLIENT_LOGO_COUNT = 17;
    await prisma.clientLogo.createMany({
      data: Array.from({ length: CLIENT_LOGO_COUNT }, (_, i) => {
        const n = i + 1;
        return {
          imageUrl: `/images/clients/clogo${n}.jpg`,
          imagePublicId: `local/client-logo-${n}`,
          altText: "Haram Textile client logo",
          order: i,
        };
      }),
    });
  }

  // --- Production steps ----------------------------------------------------
  // Real, correctly-attributed legacy factory photos already exist per step
  // (copied into public/images/production/<slug>.jpg ahead of this seed run),
  // so unlike Product/Certification we do NOT use the haramtextile.com
  // placeholder-URL convention here — imageUrl points straight at a real,
  // working local photo. imagePublicId uses a "local/production-<slug>"
  // label (not a real Cloudinary public ID) purely so the service layer's
  // image-replacement diffing has a non-empty string to compare against
  // once an admin uploads a real replacement via Cloudinary.
  const PRODUCTION_STEP_STATS: Record<string, { statLabel: string; statValue: string } | undefined> = {
    sewing: { statLabel: "Sewing machines", statValue: "160" },
    printing: { statLabel: "Design studio capacity", statValue: "5,000 cut panels/day" },
    packing: { statLabel: "Packing capacity", statValue: "600,000+ pcs/month" },
  };

  for (let index = 0; index < siteContent.manufacturing.length; index++) {
    const step = siteContent.manufacturing[index];
    const stat = PRODUCTION_STEP_STATS[step.slug];
    await prisma.productionStep.upsert({
      where: { slug: step.slug },
      create: {
        title: step.name,
        slug: step.slug,
        description: step.description,
        statLabel: stat?.statLabel ?? null,
        statValue: stat?.statValue ?? null,
        imageUrl: `/images/production/${step.slug}.jpg`,
        imagePublicId: `local/production-${step.slug}`,
        order: index,
      },
      update: {},
    });
  }

  // --- Hero config (id = 1) ----------------------------------------------
  await prisma.heroConfig.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      headline: siteContent.site.tagline,
      subtext: siteContent.home.aboutShort,
      ctaText: "Get in Touch",
      ctaLink: "/contact",
      imageUrl: `${siteContent.site.baseUrl}images/index2_slider_bg1.jpg`,
      imagePublicId: "placeholder/hero",
    },
    update: {},
  });

  // --- About content (id = 1) ----------------------------------------------
  // `storyText` uses the source `about.intro` verbatim. `missionText` is
  // composed by joining `mission`, `vision`, and `values` — all verbatim
  // source strings, just assembled into readable prose rather than left
  // as disconnected fields, since the schema only has two text slots.
  // No image was captured for the About page in the scrape (the legacy
  // about page used generic site graphics like about_chik.jpg/dairy_about.jpg
  // not attributable to "the" about photo), so imageUrl/imagePublicId are
  // left null pending a real upload via the admin panel.
  const aboutMissionText = [
    `Mission: ${siteContent.about.mission}.`,
    `Vision: ${siteContent.about.vision}.`,
    `Values: ${siteContent.about.values.join(", ")}.`,
  ].join(" ");

  await prisma.aboutContent.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      storyText: siteContent.about.intro,
      missionText: aboutMissionText,
      imageUrl: null,
      imagePublicId: null,
    },
    update: {},
  });

  // --- SEO settings (id = 1) ----------------------------------------------
  await prisma.seoSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      siteTitleSuffix: `${siteContent.site.name} — Apparel Manufacturer Pakistan`,
      defaultMetaDescription: siteContent.home.aboutShort,
      googleAnalyticsId: null,
      organizationSameAs: [],
    },
    update: {},
  });

  // --- Admin user ----------------------------------------------------------
  // Credentials come from ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD env vars
  // when set. If they are not set, we fall back to a clearly-labeled
  // placeholder so the seed never silently ships a guessable production
  // credential — operators MUST override these in `.env` (see
  // `.env.example`) and/or change the password after first login.
  const adminEmail =
    process.env.ADMIN_SEED_EMAIL?.trim() ||
    siteContent.contact.emails.find((e) => e.label === "MD")?.email ||
    "admin@haramtextile.com";
  const adminPasswordPlaintext =
    process.env.ADMIN_SEED_PASSWORD?.trim() || "CHANGE-ME-PLACEHOLDER-PASSWORD";

  // Only set the password on first creation. Re-running the seed script
  // (e.g. to pick up new product categories or certifications) must NOT
  // silently overwrite a real admin's password back to the seed value —
  // that would lock out an admin who already changed it, or reset a
  // production credential to a known placeholder. A force-reset is still
  // available, explicitly, via ADMIN_SEED_FORCE_RESET=true.
  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPasswordPlaintext, 10);
    await prisma.adminUser.create({ data: { email: adminEmail, password: hashedPassword } });

    if (!process.env.ADMIN_SEED_PASSWORD) {
      console.warn(
        `\n[seed] ADMIN_SEED_PASSWORD was not set — created admin "${adminEmail}" with the ` +
          `placeholder password "CHANGE-ME-PLACEHOLDER-PASSWORD". Set ADMIN_SEED_EMAIL and ` +
          `ADMIN_SEED_PASSWORD in your .env and re-run \`npm run db:seed\` before deploying, ` +
          `or log in once and change it manually.\n`,
      );
    }
  } else if (process.env.ADMIN_SEED_FORCE_RESET === "true") {
    const hashedPassword = await bcrypt.hash(adminPasswordPlaintext, 10);
    await prisma.adminUser.update({
      where: { email: adminEmail },
      data: { password: hashedPassword },
    });
    console.warn(`[seed] ADMIN_SEED_FORCE_RESET=true — admin "${adminEmail}" password was reset.`);
  } else {
    console.log(
      `[seed] Admin "${adminEmail}" already exists — password left unchanged. Set ` +
        `ADMIN_SEED_FORCE_RESET=true to force a reset.`,
    );
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
