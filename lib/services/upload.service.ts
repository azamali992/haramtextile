import { uploadImage } from "@/lib/storage";

export async function handleImageUpload(file: File): Promise<{ url: string; publicId: string }> {
  return uploadImage(file);
}
