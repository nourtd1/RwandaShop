import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Client Supabase pour usage côté navigateur (Client Components).
 * Instancie un singleton par tab — appeler dans un hook ou en haut de composant.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Persiste la session dans localStorage (défaut navigateur)
        persistSession: true,
        // Rafraîchit automatiquement le token avant expiration
        autoRefreshToken: true,
        // Détecte la session depuis l'URL (OAuth callback)
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          "x-app-name": "rwandashop-web",
        },
      },
    }
  );
}
