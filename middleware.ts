import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

const PROTECTED_ROUTES = ["/checkout", "/order-confirmation", "/account"];
const ADMIN_ROUTES     = ["/admin"];
const AUTH_ROUTES      = ["/login", "/register"];

// Cookie that caches the admin role to avoid a DB round-trip on every /admin request.
// It is invalidated on sign-out by deleting it, and re-verified against the DB when absent.
const ROLE_COOKIE = "x-role-cache";
const ROLE_COOKIE_MAX_AGE = 60 * 5; // 5 minutes

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute     = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute      = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if ((isProtectedRoute || isAdminRoute) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && user) {
    const cached = request.cookies.get(ROLE_COOKIE)?.value;

    if (cached === "admin") {
      // Cache hit — skip DB query
    } else {
      // Cache miss or stale — query DB and refresh cookie
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        response.cookies.delete(ROLE_COOKIE);
        return NextResponse.redirect(new URL("/", request.url), { status: 303 });
      }

      response.cookies.set(ROLE_COOKIE, "admin", {
        httpOnly: true,
        sameSite: "lax",
        maxAge:   ROLE_COOKIE_MAX_AGE,
        path:     "/admin",
      });
    }
  }

  // Clear role cache on auth routes (sign-out path)
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Clear role cache when user signs out
  if (!user && request.cookies.has(ROLE_COOKIE)) {
    response.cookies.delete(ROLE_COOKIE);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|css|js|json|map)$).*)",
  ],
};
