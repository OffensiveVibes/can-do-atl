import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.warn("Supabase server configuration is incomplete. Add VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel before deploying.");
}

export const supabaseAdmin = createClient(
  url ?? "https://placeholder.supabase.co",
  serviceRoleKey ?? "placeholder",
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export async function getSupabaseIdentity(accessToken: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}
