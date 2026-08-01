import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — ALLEEN gebruiken in server-routes die buiten een
 * user-sessie om moeten schrijven (Mollie-webhook, billing-run).
 * Vereist SUPABASE_SERVICE_ROLE_KEY in de env (nooit client-side).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (of NEXT_PUBLIC_SUPABASE_URL) ontbreekt — vereist voor billing-routes."
    );
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
