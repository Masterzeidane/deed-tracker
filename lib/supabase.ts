import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// createClient is always called so the module loads without throwing during
// Next.js static rendering. Requests made without valid credentials will
// fail at runtime with a network error, which useAuth surfaces to the user.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-anon-key"
);

/** True when both env vars are present — used to show a setup screen. */
export const isSupabaseConfigured = Boolean(url && key);
