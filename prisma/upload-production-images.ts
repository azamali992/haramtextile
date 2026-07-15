/**
 * One-off bulk upload - pushes the newly updated production step photos
 * (cutting, printing, sewing, packing - each 2-8MB) to Cloudinary instead of
 * committing them to git, then prints the values for
 * lib/production-image-fallback.ts.
 *
 * Run: npx tsx prisma/upload-production-images.ts
 */
import "dotenv/config";
import { config as loadEnvLocal } from "dotenv";
loadEnvLocal({ path: ".env.local", override: true });

import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const BASE_DIR = path.join(__dirname, "..", "public", "images", "production");
const UPLOAD_FOLDER = "haram-textile/production";
const FILES = ["cutting.png", "printing.png", "sewing.png", "packing.png"];

async function main() {
  const urls: Record<string, string> = {};

  for (const file of FILES) {
    const slug = path.parse(file).name;
    const localPath = path.join(BASE_DIR, file);
    const publicId = `${UPLOAD_FOLDER}/${slug}`;

    const result = await cloudinary.uploader.upload(localPath, {
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
    });

    const uploadMarker = "/upload/";
    const idx = result.secure_url.indexOf(uploadMarker);
    const prefix = result.secure_url.slice(0, idx + uploadMarker.length);
    const url = `${prefix}f_auto,q_auto,w_auto/${UPLOAD_FOLDER}/${slug}`;

    urls[slug] = url;
    console.log(`[upload] ${file} -> ${url} (${result.width}x${result.height})`);
  }

  console.log("\n\n=== lib/production-image-fallback.ts values ===\n");
  for (const [slug, url] of Object.entries(urls)) {
    console.log(`  ${slug}: "${url}",`);
  }
}

main().catch((error) => {
  console.error("[upload-production-images] Failed:", error);
  process.exitCode = 1;
});
