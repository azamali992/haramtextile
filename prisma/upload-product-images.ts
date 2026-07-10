/**
 * One-off bulk upload — pushes the `products_new` category fallback photos
 * (boys/girls/ladies) to Cloudinary instead of committing them to git, then
 * prints the manifest snippet for `lib/product-image-fallback.ts`.
 *
 * Run: npx tsx prisma/upload-product-images.ts
 */
import "dotenv/config";
import { config as loadEnvLocal } from "dotenv";
loadEnvLocal({ path: ".env.local", override: true });

import fs from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const BASE_DIR = path.join(__dirname, "..", "public", "images", "products_new");
const CATEGORIES = ["boys", "girls", "ladies"] as const;
const UPLOAD_FOLDER = "haram-textile/products_new";

async function main() {
  const manifest: Record<string, { dir: string; entries: { file: string; width: number; height: number }[] }> = {};

  for (const category of CATEGORIES) {
    const dir = path.join(BASE_DIR, category);
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".png"))
      .sort((a, b) => parseInt(a) - parseInt(b));

    const entries: { file: string; width: number; height: number }[] = [];
    let cloudinaryDir = "";

    for (const file of files) {
      const n = path.parse(file).name; // "1", "2", ...
      const localPath = path.join(dir, file);
      const publicId = `${UPLOAD_FOLDER}/${category}/${n}`;

      const result = await cloudinary.uploader.upload(localPath, {
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      });

      if (!cloudinaryDir) {
        const uploadMarker = "/upload/";
        const idx = result.secure_url.indexOf(uploadMarker);
        const prefix = result.secure_url.slice(0, idx + uploadMarker.length);
        cloudinaryDir = `${prefix}f_auto,q_auto,w_auto/${UPLOAD_FOLDER}/${category}`;
      }

      entries.push({ file: `${n}.png`, width: result.width, height: result.height });
      console.log(`[upload] ${category}/${file} -> ${result.public_id} (${result.width}x${result.height})`);
    }

    manifest[category] = { dir: cloudinaryDir, entries };
  }

  console.log("\n\n=== Paste into lib/product-image-fallback.ts MANIFEST ===\n");
  for (const category of CATEGORIES) {
    console.log(`${category}: {`);
    console.log(`  dir: "${manifest[category].dir}",`);
    console.log(`  entries: [`);
    for (const e of manifest[category].entries) {
      console.log(`    { file: "${e.file}", width: ${e.width}, height: ${e.height} },`);
    }
    console.log(`  ],`);
    console.log(`},`);
  }
}

main().catch((error) => {
  console.error("[upload-product-images] Failed:", error);
  process.exitCode = 1;
});
