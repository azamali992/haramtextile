/**
 * One-off: replace the seeded placeholder certifications with the real
 * "certificate-2" certificate. Uploads the image + PDF to Cloudinary, deletes
 * the old cert rows (and their Cloudinary assets, best-effort), and creates
 * the new certification row.
 *
 * Run: npx tsx -r dotenv/config prisma/replace-certifications.ts dotenv_config_path=.env.local
 */
import "dotenv/config";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { config } from "../lib/config";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true,
});

const CERT_DIR = path.join(__dirname, "..", "public", "images", "certifications");

async function main() {
  const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  // 1. Upload image (with auto f/q/w) + PDF (raw) to Cloudinary.
  const imageRes = await cloudinary.uploader.upload(
    path.join(CERT_DIR, "certificate-2.jpeg"),
    { public_id: "haram-textile/certificates/certificate-2", overwrite: true, resource_type: "image" },
  );
  const imgMarker = "/upload/";
  const imgIdx = imageRes.secure_url.indexOf(imgMarker);
  const imageUrl =
    imageRes.secure_url.slice(0, imgIdx + imgMarker.length) +
    "f_auto,q_auto,w_auto/" +
    imageRes.secure_url.slice(imgIdx + imgMarker.length);
  console.log(`[image] ${imageUrl}`);

  const pdfRes = await cloudinary.uploader.upload(
    path.join(CERT_DIR, "certificate_2.pdf"),
    { public_id: "haram-textile/certificates/certificate-2", overwrite: true, resource_type: "raw" },
  );
  console.log(`[pdf]   ${pdfRes.secure_url}`);

  // 2. Delete the old placeholder certs (best-effort Cloudinary cleanup —
  //    they use "placeholder/certification" ids that aren't real assets).
  const old = await prisma.certification.findMany();
  for (const c of old) {
    if (c.imagePublicId && !c.imagePublicId.startsWith("placeholder/")) {
      await cloudinary.uploader.destroy(c.imagePublicId, { resource_type: "image" }).catch(() => {});
    }
    if (c.pdfPublicId) {
      await cloudinary.uploader.destroy(c.pdfPublicId, { resource_type: "raw" }).catch(() => {});
    }
  }
  const del = await prisma.certification.deleteMany({});
  console.log(`[db] deleted ${del.count} old certification(s)`);

  // 3. Create the new certification.
  const created = await prisma.certification.create({
    data: {
      name: "GOTS — Global Organic Textile Standard",
      issuingBody: "USB Certification (Version 7.0)",
      description:
        "Haram Textile is GOTS-certified (Scope Certificate USB TEX-10641-GOTS-2601), audited and found in conformity with the Global Organic Textile Standard Version 7.0 for knitting and manufacturing of organic apparel. Valid until 21 January 2027.",
      imageUrl,
      imagePublicId: imageRes.public_id,
      pdfUrl: pdfRes.secure_url,
      pdfPublicId: pdfRes.public_id,
    },
  });
  console.log(`[db] created certification ${created.id} — ${created.name}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("[replace-certifications] Failed:", e);
  process.exit(1);
});
