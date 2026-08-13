import { supabaseAdmin } from "./supabase";

const BUCKET = "site-media";

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const body = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const { data: uploaded, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, body, { contentType, upsert: false });

  if (error || !uploaded) throw new Error(`Supabase Storage upload failed: ${error?.message ?? "unknown error"}`);
  const { data: publicUrl } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(uploaded.path);
  return { key: uploaded.path, url: publicUrl.publicUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(key);
  return { key, url: data.publicUrl };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(normalizeKey(relKey), 60 * 10);
  if (error || !data?.signedUrl) throw new Error(`Supabase Storage signing failed: ${error?.message ?? "unknown error"}`);
  return data.signedUrl;
}
