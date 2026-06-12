import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("[Supabase] MISSING NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseKey) {
  console.error("[Supabase] MISSING SUPABASE_SERVICE_ROLE_KEY");
}

const keyType = supabaseKey?.startsWith("sb_publishable_")
  ? "publishable (anon)"
  : supabaseKey?.startsWith("eyJ")
    ? "JWT"
    : "unknown";

console.log(`[Supabase] Initializing with URL: ${supabaseUrl ? "✓ set" : "✗ missing"}, key type: ${keyType}`);

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseKey ?? "",
);
