import { uploadImage, uploadPdf } from "@/lib/storage";

export async function handleImageUpload(file: File): Promise<{ url: string; publicId: string }> {
  return uploadImage(file);
}

export async function handlePdfUpload(file: File): Promise<{ url: string; publicId: string }> {
  return uploadPdf(file);
}
