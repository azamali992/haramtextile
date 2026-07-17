/**
 * Seeds the singleton ContactSettings row from the static site content, so the
 * admin Contact Details page opens with the values the site is already showing.
 * Safe to re-run: it upserts id=1.
 *
 * Run with: npx tsx prisma/seed-contact-settings.ts
 */
import { siteContent } from "../lib/site-content";
import { prisma } from "../lib/prisma";

async function main() {
  const { phone, address, mapLink, hours, emails } = siteContent.contact;

  // Map to an object literal type: Prisma's JSON input rejects the
  // `SiteContentEmail` interface, which has no index signature.
  const emailsJson = emails.map((e) => ({ label: e.label, email: e.email }));

  const row = await prisma.contactSettings.upsert({
    where: { id: 1 },
    create: { id: 1, phone, address, mapLink, hours, emails: emailsJson },
    update: { phone, address, mapLink, hours, emails: emailsJson },
  });

  console.log("ContactSettings seeded:", {
    phone: row.phone,
    emails: row.emails,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
