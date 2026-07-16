/**
 * Cloudinary-backed image storage.
 *
 * This is the ONLY file in the codebase allowed to import the Cloudinary
 * SDK. Every other module (routes, services, components) must go through
 * `uploadImage` / `deleteImage` exported here - never call Cloudinary
 * directly elsewhere.
 */
import { v2 as cloudinary } from "cloudinary";
import { config } from "@/lib/config";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true,
});

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20MB — scanned certificates run larger
const UPLOAD_FOLDER = "haram-textile";
const PDF_UPLOAD_FOLDER = "haram-textile/certificates";

/**
 * Detects an image's real MIME type from its file signature ("magic
 * bytes"), independent of whatever `Content-Type`/`file.type` the
 * client/browser declared. `file.type` is attacker-controlled - a malicious
 * client can label arbitrary bytes (e.g. an HTML/SVG/script payload) as
 * `image/jpeg` to slip past a check that only inspects the declared type.
 * Returns `null` when the buffer doesn't match any allowed signature.
 */
function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

/**
 * Appends an auto-format/auto-quality/auto-width transformation segment to
 * a Cloudinary delivery URL so images are served as responsive WebP (or
 * whatever format/size best matches the requesting client) without us
 * having to generate multiple derivatives ourselves.
 *
 * Cloudinary delivery URLs look like:
 *   https://res.cloudinary.com/<cloud>/image/upload/v169.../folder/name.jpg
 * Transformations are inserted as a path segment immediately after
 * `/upload/`.
 */
function withAutoTransformation(secureUrl: string): string {
  const uploadMarker = "/upload/";
  const markerIndex = secureUrl.indexOf(uploadMarker);

  if (markerIndex === -1) {
    // Unexpected URL shape - return as-is rather than risk corrupting it.
    return secureUrl;
  }

  const insertAt = markerIndex + uploadMarker.length;
  return (
    secureUrl.slice(0, insertAt) +
    "f_auto,q_auto,w_auto/" +
    secureUrl.slice(insertAt)
  );
}

/**
 * Validates and uploads an image file to Cloudinary.
 *
 * Security boundary: this is the only place in the app that accepts raw
 * file uploads, so we strictly validate MIME type and size before ever
 * handing bytes to a third-party SDK. The declared `file.type` is
 * client-supplied and untrustworthy on its own, so after the cheap
 * declared-type/size checks we also sniff the actual file signature
 * ("magic bytes") from the buffer and require it to match both the
 * allow-list and the client's declared type before uploading - and use the
 * sniffed (not declared) MIME type when building the data URI.
 *
 * @throws Error if the file type is unsupported or the file is too large.
 */
export async function uploadImage(file: File): Promise<{ url: string; publicId: string }> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      `Unsupported file type "${file.type}". Only JPG, PNG, and WebP images are allowed.`,
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File is too large (${file.size} bytes). Maximum allowed size is ${MAX_FILE_SIZE_BYTES} bytes (10MB).`,
    );
  }

  if (file.size === 0) {
    throw new Error("File is empty.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const detectedMime = detectImageMime(buffer);
  if (!detectedMime || detectedMime !== file.type || !ALLOWED_MIME_TYPES.has(detectedMime)) {
    throw new Error(
      `Unsupported file type "${file.type}". Only JPG, PNG, and WebP images are allowed.`,
    );
  }

  const base64 = buffer.toString("base64");
  const dataUri = `data:${detectedMime};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: UPLOAD_FOLDER,
    resource_type: "image",
  });

  return { url: withAutoTransformation(result.secure_url), publicId: result.public_id };
}

/**
 * Validates and uploads a PDF file to Cloudinary as a `raw` asset.
 *
 * Same security posture as `uploadImage`: the declared `file.type` is
 * client-supplied, so after the cheap declared-type/size checks we sniff
 * the actual file signature (`%PDF-`) from the buffer and require it to
 * match before uploading. Stored under a dedicated `certificates` folder as
 * a `raw` resource (Cloudinary's image pipeline doesn't apply to PDFs).
 *
 * @throws Error if the file is not a valid PDF or is too large.
 */
export async function uploadPdf(file: File): Promise<{ url: string; publicId: string }> {
  if (file.type !== "application/pdf") {
    throw new Error(`Unsupported file type "${file.type}". Only PDF files are allowed.`);
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error(
      `File is too large (${file.size} bytes). Maximum allowed size is ${MAX_PDF_SIZE_BYTES} bytes (20MB).`,
    );
  }

  if (file.size === 0) {
    throw new Error("File is empty.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // %PDF- magic bytes (25 50 44 46 2D).
  const isPdf =
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d;
  if (!isPdf) {
    throw new Error(`Unsupported file type "${file.type}". Only PDF files are allowed.`);
  }

  const base64 = buffer.toString("base64");
  const dataUri = `data:application/pdf;base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: PDF_UPLOAD_FOLDER,
    resource_type: "raw",
  });

  return { url: result.secure_url, publicId: result.public_id };
}

/**
 * Deletes an asset from Cloudinary by its public ID. Safe to call on an
 * ID that no longer exists (Cloudinary returns `not found` rather than
 * throwing in that case). Pass `resourceType: "raw"` for PDFs.
 */
export async function deleteImage(
  publicId: string,
  resourceType: "image" | "raw" = "image",
): Promise<void> {
  if (!publicId || publicId.trim() === "") {
    throw new Error("publicId is required to delete an asset.");
  }

  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
