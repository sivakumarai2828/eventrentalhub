import { STORAGE_BUCKET, supabase } from "./supabase";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_IMAGES = 20;

export function validateImage(file: File): string | null {
  if (!ALLOWED.includes(file.type)) {
    return "Only JPG, PNG and WEBP images are allowed.";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "Images must be 5MB or smaller.";
  }
  return null;
}

/** Upload a file to Supabase Storage and return its public URL. */
export async function uploadImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Render a smaller, transformed variant for thumbnails / lazy grids. */
export function thumbnail(url: string | null, width = 600): string | undefined {
  if (!url) return undefined;
  // Supabase image transformation (render/image) — falls back gracefully
  // for non-Supabase URLs (the param is simply ignored by other hosts).
  if (url.includes("/storage/v1/object/public/")) {
    return url.replace(
      "/object/public/",
      `/render/image/public/`,
    ) + `?width=${width}&quality=70`;
  }
  return url;
}
