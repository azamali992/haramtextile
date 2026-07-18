/**
 * Replaces the gents catalog entirely with the refreshed product set and adds
 * the one new ladies product, using the images already uploaded to Cloudinary
 * under haram-textile/products_new/{gents,ladies} (see
 * prisma/upload-gents-ladies.ts).
 *
 *  - Deletes every existing gents Product row (and best-effort removes any real
 *    Cloudinary asset they owned), then creates one row per new gents photo.
 *  - Creates the ladies "21" product if it doesn't already exist (idempotent).
 *
 * Names are generic (garment type + color); on-garment print/logo text is never
 * used as a product name, matching prisma/create-catalog-products.ts.
 *
 * Run: npx tsx prisma/replace-gents-add-ladies.ts
 */
import "dotenv/config";
import { config as loadEnvLocal } from "dotenv";
loadEnvLocal({ path: ".env.local", override: true });

import { v2 as cloudinary } from "cloudinary";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CLOUDINARY_BASE =
  "https://res.cloudinary.com/ds08efkdx/image/upload/f_auto,q_auto,w_auto/haram-textile/products_new";

interface CatalogEntry {
  file: string; // "1.png" - matches the uploaded Cloudinary public_id number
  name: string;
  description: string;
}

const GENTS: CatalogEntry[] = [
  { file: "1.png", name: "Striped Pullover Hoodie - Navy & Cream", description: "Men's pullover hoodie with allover horizontal stripes and a drawstring hood." },
  { file: "2.png", name: "Contrast-Lined Pullover Hoodie - Charcoal", description: "Men's charcoal pullover hoodie with a contrast hood lining, drawcord, and kangaroo pocket." },
  { file: "3.png", name: "Striped Polo Shirt - Brown & Cream", description: "Men's short-sleeve piqué polo shirt with allover horizontal stripes." },
  { file: "4.png", name: "Graphic Pullover Hoodie - Charcoal", description: "Men's charcoal pullover hoodie with a printed back graphic." },
  { file: "5.png", name: "Herringbone Quarter-Zip Polo - Brown", description: "Men's long-sleeve quarter-zip polo in a herringbone-textured knit." },
  { file: "6.png", name: "Colorblock Quarter-Zip Pullover - Grey", description: "Men's quarter-zip pullover with contrast shoulder panels and a chest pocket." },
  { file: "7.png", name: "Graphic Pullover Hoodie - Heather Grey", description: "Men's heather-grey pullover hoodie with a printed front graphic." },
];

const LADIES_NEW: CatalogEntry[] = [
  { file: "21.png", name: "Acid-Wash Co-ord Set - Pink", description: "Ladies acid-wash lounge co-ord: a cropped short-sleeve tee with matching wide-leg drawstring trousers." },
];

async function main() {
  const [gentsCat, ladiesCat] = await Promise.all([
    prisma.category.findFirst({ where: { slug: "gents" } }),
    prisma.category.findFirst({ where: { slug: "ladies" } }),
  ]);

  if (!gentsCat) throw new Error('Category "gents" not found.');
  if (!ladiesCat) throw new Error('Category "ladies" not found.');

  // ── Replace gents entirely ────────────────────────────────────────────────
  const oldGents = await prisma.product.findMany({ where: { categoryId: gentsCat.id } });
  console.log(`[gents] removing ${oldGents.length} existing product(s)`);

  for (const p of oldGents) {
    // Best-effort: drop the old Cloudinary asset if it was a real upload
    // (skip legacy "placeholder/..." ids that point nowhere real).
    if (p.imagePublicId && !p.imagePublicId.startsWith("placeholder/")) {
      await cloudinary.uploader
        .destroy(p.imagePublicId, { resource_type: "image" })
        .then((r) => console.log(`[gents] cloudinary destroy ${p.imagePublicId}: ${r.result}`))
        .catch((e) => console.warn(`[gents] cloudinary destroy failed ${p.imagePublicId}: ${e?.message ?? e}`));
    }
  }

  await prisma.product.deleteMany({ where: { categoryId: gentsCat.id } });

  for (const entry of GENTS) {
    const n = entry.file.replace(/\.png$/, "");
    await prisma.product.create({
      data: {
        name: entry.name,
        description: entry.description,
        imageUrl: `${CLOUDINARY_BASE}/gents/${entry.file}`,
        imagePublicId: `haram-textile/products_new/gents/${n}`,
        moq: null,
        fabricType: null,
        tags: [],
        categoryId: gentsCat.id,
        seoTitle: entry.name,
        seoDescription: entry.description,
        focusKeyword: "gents",
      },
    });
    console.log(`[gents] created ${entry.file} - ${entry.name}`);
  }

  // ── Add the new ladies product (idempotent) ───────────────────────────────
  for (const entry of LADIES_NEW) {
    const n = entry.file.replace(/\.png$/, "");
    const imagePublicId = `haram-textile/products_new/ladies/${n}`;
    const existing = await prisma.product.findFirst({ where: { imagePublicId } });
    if (existing) {
      console.log(`[ladies] ${entry.file} already exists - skipping`);
      continue;
    }
    await prisma.product.create({
      data: {
        name: entry.name,
        description: entry.description,
        imageUrl: `${CLOUDINARY_BASE}/ladies/${entry.file}`,
        imagePublicId,
        moq: null,
        fabricType: null,
        tags: [],
        categoryId: ladiesCat.id,
        seoTitle: entry.name,
        seoDescription: entry.description,
        focusKeyword: "ladies",
      },
    });
    console.log(`[ladies] created ${entry.file} - ${entry.name}`);
  }

  const gentsCount = await prisma.product.count({ where: { categoryId: gentsCat.id } });
  const ladiesCount = await prisma.product.count({ where: { categoryId: ladiesCat.id } });
  console.log(`\n[done] gents now ${gentsCount}, ladies now ${ladiesCount}`);
}

main()
  .catch((error) => {
    console.error("[replace-gents-add-ladies] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
