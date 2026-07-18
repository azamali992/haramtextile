/**
 * One-off bulk upload for the refreshed product photos:
 *  - gents: brand-new set (replaces the old scraped `products/gents` JPGs)
 *  - ladies: re-uploads the full set so the newly added photo is included
 *
 * Pushes `public/images/products_new/{gents,ladies}/*.png` to Cloudinary
 * (overwrite = true, so re-running is idempotent) and prints the manifest
 * snippet to paste into `lib/product-image-fallback.ts`.
 *
 * Run: npx tsx prisma/upload-gents-ladies.ts
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
// Optional CLI args select categories; defaults to both.
const CATEGORIES = (process.argv.slice(2).length > 0
  ? process.argv.slice(2)
  : ["gents", "ladies"]) as readonly string[];
const UPLOAD_FOLDER = "haram-textile/products_new";

/** Upload with a few retries - the Cloudinary TLS stream occasionally drops mid-batch. */
async function uploadWithRetry(localPath: string, publicId: string, attempts = 4) {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await cloudinary.uploader.upload(localPath, {
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      });
    } catch (error) {
      lastError = error;
      console.warn(`[retry ${i}/${attempts}] ${publicId}: ${error instanceof Error ? error.message : error}`);
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
  throw lastError;
}

async function main() {
  const manifest: Record<
    string,
    { dir: string; entries: { file: string; width: number; height: number }[] }
  > = {};

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

      const result = await uploadWithRetry(localPath, publicId);

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
  console.error("[upload-gents-ladies] Failed:", error);
  process.exitCode = 1;
});
