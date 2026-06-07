import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

// Routes that require an active session
const PROTECTED_ROUTES = ["/checkout", "/order-confirmation", "/account"];
// Admin-only routes
const ADMIN_ROUTES     = ["/admin"];
// Routes accessible only when NOT logged in
const AUTH_ROUTES      = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Refresh session — required for SSR to stay in sync
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute     = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute      = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Redirect unauthenticated users away from protected routes
  if ((isProtectedRoute || isAdminRoute) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin role check — only query DB when user is logged in AND route is admin
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // If profile doesn't exist yet or role isn't admin, redirect home
    // Use 303 (See Other) to avoid redirect loop caching
    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url), { status: 303 });
    }
  }

  // Redirect already-logged-in users away from login/register
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - api/health    (health check endpoint — no auth needed)
     * - Public assets (images, fonts, manifests)
     *
     * This keeps the middleware lean: it only runs on actual page routes,
     * not on every asset fetch, which was causing slowness.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|css|js|json|map)$).*)",
  ],
};
