/**
 * One-off catalog build - creates one Product row per image already
 * uploaded to Cloudinary under haram-textile/products_new/{boys,girls,ladies}
 * (see prisma/upload-product-images.ts), so every photo gets its own
 * product card instead of being shared category "cover art".
 *
 * Names are generic (garment type + color) - these are manufactured items,
 * not Haram-owned brands, so on-garment print/logo text is never used as
 * the product name.
 *
 * Idempotent: skips a (category, imagePublicId) pair that already exists,
 * so it's safe to re-run after adding more entries below.
 *
 * Run: npx tsx prisma/create-catalog-products.ts
 */
import "dotenv/config";
import { config as loadEnvLocal } from "dotenv";
loadEnvLocal({ path: ".env.local", override: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CLOUDINARY_BASE =
  "https://res.cloudinary.com/ds08efkdx/image/upload/f_auto,q_auto,w_auto/haram-textile/products_new";

interface CatalogEntry {
  category: "boys" | "girls" | "ladies";
  file: string; // e.g. "1.png" - matches the uploaded Cloudinary public_id number
  name: string;
  description: string;
}

const ENTRIES: CatalogEntry[] = [
  // ── Boys ──────────────────────────────────────────────────────────────
  { category: "boys", file: "1.png", name: "Graphic Crewneck Sweatshirt - Cream", description: "Boys crewneck sweatshirt with an allover graphic print." },
  { category: "boys", file: "2.png", name: "Allover Print Crewneck Sweatshirt - Cream", description: "Boys crewneck sweatshirt with a repeating allover print." },
  { category: "boys", file: "3.png", name: "Graphic Crewneck Sweatshirt - Burgundy", description: "Boys crewneck sweatshirt with a front graphic print." },
  { category: "boys", file: "4.png", name: "Varsity Jacket - Green & White", description: "Boys colorblock varsity-style jacket with snap-button front." },
  { category: "boys", file: "5.png", name: "Graphic Crewneck Sweatshirt - Teal", description: "Boys crewneck sweatshirt with a front graphic print." },
  { category: "boys", file: "6.png", name: "Graphic Rain Jacket - Navy Blue", description: "Boys hooded jacket with a front graphic print." },
  { category: "boys", file: "7.png", name: "Graphic Crewneck Sweatshirt - Navy", description: "Boys crewneck sweatshirt with a front graphic print." },
  { category: "boys", file: "8.png", name: "Colorblock Graphic Sweatshirt - Cream & Green", description: "Boys colorblock crewneck sweatshirt with a front graphic print." },
  { category: "boys", file: "9.png", name: "Varsity Patch Sweatshirt - Cream", description: "Boys crewneck sweatshirt with varsity-style patch appliqués." },
  { category: "boys", file: "10.png", name: "Varsity Patch Sweatshirt - Cream (Style 2)", description: "Boys crewneck sweatshirt with varsity-style patch appliqués." },

  // ── Girls ─────────────────────────────────────────────────────────────
  { category: "girls", file: "1.png", name: "Graphic T-Shirt - Cream", description: "Girls short-sleeve t-shirt with a front graphic print." },
  { category: "girls", file: "2.png", name: "Layered-Look Graphic T-Shirt - Black & White", description: "Girls long-sleeve t-shirt with a layered hem/cuff look and front graphic print." },
  { category: "girls", file: "3.png", name: "Allover Print Sweatshirt - Pink", description: "Girls crewneck sweatshirt with a repeating allover print." },
  { category: "girls", file: "4.png", name: "Graphic Sweatshirt - Pink", description: "Girls crewneck sweatshirt with a front graphic print." },
  { category: "girls", file: "5.png", name: "Graphic T-Shirt - Black", description: "Girls short-sleeve t-shirt with a front graphic print." },
  { category: "girls", file: "6.png", name: "Floral Zip Hoodie - White", description: "Girls zip-front hooded sweatshirt with an allover floral print." },

  // ── Ladies ────────────────────────────────────────────────────────────
  { category: "ladies", file: "1.png", name: "Floral Zip Hoodie - Cream", description: "Ladies zip-front hooded sweatshirt with an allover floral print." },
  { category: "ladies", file: "2.png", name: "Floral Zip Hoodie - Black", description: "Ladies zip-front hooded sweatshirt with an allover floral print." },
  { category: "ladies", file: "3.png", name: "Floral Bomber Jacket - Green & Pink", description: "Ladies zip-front bomber jacket with an allover floral print." },
  { category: "ladies", file: "4.png", name: "Graphic Crop Top - Pink", description: "Ladies short-sleeve cropped t-shirt with a front graphic print." },
  { category: "ladies", file: "5.png", name: "Floral Zip Hoodie - Purple", description: "Ladies zip-front hooded sweatshirt with an allover floral print." },
  { category: "ladies", file: "6.png", name: "Polo Crop Top - White & Green", description: "Ladies cropped polo-style top with a front graphic print." },
  { category: "ladies", file: "7.png", name: "Floral Bomber Jacket - Black & Pink", description: "Ladies zip-front bomber jacket with an allover floral print." },
  { category: "ladies", file: "8.png", name: "Tie-Dye Tank Top - Purple", description: "Ladies sleeveless tank top with a tie-dye print." },
  { category: "ladies", file: "9.png", name: "Tie-Dye Graphic T-Shirt - Orange & Green", description: "Ladies short-sleeve t-shirt with a tie-dye print and front graphic." },
  { category: "ladies", file: "10.png", name: "Vintage Graphic Crop Top - Grey", description: "Ladies asymmetric cropped top with a front graphic print." },
  { category: "ladies", file: "11.png", name: "Burnout V-Neck T-Shirt - Grey", description: "Ladies V-neck t-shirt in a burnout wash finish." },
  { category: "ladies", file: "12.png", name: "Lace-Trim Cami Top - Grey & Black", description: "Ladies camisole top with lace trim and a front graphic print." },
  { category: "ladies", file: "13.png", name: "Ribbon-Tie Cami Top - Black", description: "Ladies camisole top with ribbon-tie shoulder detail." },
  { category: "ladies", file: "14.png", name: "Embroidered Cami Top - White", description: "Ladies ribbed camisole top with embroidered appliqués." },
  { category: "ladies", file: "15.png", name: "Graphic Halter Top - Blue", description: "Ladies asymmetric halter-neck top with a front graphic print." },
  { category: "ladies", file: "16.png", name: "Floral Bomber Jacket - Pink & Purple", description: "Ladies zip-front bomber jacket with an allover floral print." },
  { category: "ladies", file: "17.png", name: "Graphic Print Hoodie - Pastel Multicolor", description: "Ladies pullover hoodie with a front graphic print." },
  { category: "ladies", file: "18.png", name: "Floral Print Hoodie - Black & Pink", description: "Ladies pullover hoodie with an allover floral print." },
  { category: "ladies", file: "19.png", name: "Floral Bomber Jacket - White & Blue", description: "Ladies zip-front bomber jacket with an allover floral print." },
  { category: "ladies", file: "20.png", name: "Cutout Tank Top - White", description: "Ladies sleeveless tank top with a floral cutout appliqué." },
];

async function main() {
  const categories = await prisma.category.findMany({
    where: { slug: { in: ["boys", "girls", "ladies"] } },
  });
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  let created = 0;
  let skipped = 0;

  for (const entry of ENTRIES) {
    const categoryId = categoryIdBySlug.get(entry.category);
    if (!categoryId) {
      console.warn(`[create-catalog] Category "${entry.category}" not found - skipping ${entry.file}`);
      continue;
    }

    const n = entry.file.replace(/\.png$/, "");
    const imagePublicId = `haram-textile/products_new/${entry.category}/${n}`;
    const imageUrl = `${CLOUDINARY_BASE}/${entry.category}/${entry.file}`;

    const existing = await prisma.product.findFirst({ where: { imagePublicId } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.product.create({
      data: {
        name: entry.name,
        description: entry.description,
        imageUrl,
        imagePublicId,
        moq: null,
        fabricType: null,
        tags: [],
        categoryId,
        seoTitle: entry.name,
        seoDescription: entry.description,
        focusKeyword: entry.category,
      },
    });
    created++;
    console.log(`[create-catalog] created ${entry.category}/${entry.file} - ${entry.name}`);
  }

  console.log(`\n[create-catalog] Done. Created ${created}, skipped ${skipped} (already existed).`);
}

main()
  .catch((error) => {
    console.error("[create-catalog] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
