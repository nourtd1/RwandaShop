import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Client Supabase pour usage côté serveur :
 * Server Components, Route Handlers, Server Actions, Middleware.
 *
 * Doit être appelé avec `await createClient()` car `cookies()` est async
 * depuis Next.js 15 (compatible 14 aussi via await).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // `setAll` peut être appelé depuis un Server Component en lecture seule.
            // Le middleware se chargera de persister les cookies dans ce cas.
          }
        },
      },
      global: {
        headers: {
          "x-app-name": "rwandashop-server",
        },
      },
    }
  );
}

/**
 * Client Supabase avec la clé service-role (accès total, bypass RLS).
 * Réservé aux Server Actions / Route Handlers d'administration.
 * NE JAMAIS exposer côté client.
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Même raison que ci-dessus
          }
        },
      },
      auth: {
        // Le service-role ne doit jamais persister de session utilisateur
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
