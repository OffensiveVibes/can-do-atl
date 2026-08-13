import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  console.warn("Supabase browser configuration is incomplete. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before deploying.");
}

export const supabase = createClient(
  url ?? "https://placeholder.supabase.co",
  publishableKey ?? "placeholder",
);
