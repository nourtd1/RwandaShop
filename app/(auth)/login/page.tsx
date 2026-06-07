"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { z } from "zod";
import { Leaf, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ── Zod schema ────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password required"),
});

type LoginForm = z.infer<typeof loginSchema>;
type FieldErrors = Partial<Record<keyof LoginForm, string>>;

// ── Supabase error translation ────────────────────────────────────

function translateError(msg: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials":  "Incorrect email or password.",
    "Email not confirmed":         "Please confirm your email address before signing in.",
    "Too many requests":           "Too many attempts. Please try again in a few minutes.",
    "User not found":              "No account associated with this email.",
    "Email rate limit exceeded":   "Email sending limit reached. Please try again later.",
  };
  for (const [key, val] of Object.entries(map)) {
    if (msg.includes(key)) return val;
  }
  return "An unexpected error occurred. Please try again.";
}

// ── Google OAuth ──────────────────────────────────────────────────

function GoogleButton({ loading }: { loading: boolean }) {
  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      className={cn(
        "w-full flex items-center justify-center gap-3 px-4 py-2.5",
        "border border-gray-300 rounded-md text-sm font-medium text-gray-700",
        "bg-white hover:bg-gray-50 transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Continue with Google
    </button>
  );
}

// ── Form (separated for Suspense boundary on useSearchParams) ─────

function LoginForm() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const redirectTo    = searchParams.get("redirect") ?? "/";
  const justRegistered = searchParams.get("registered") === "true";
  const authError      = searchParams.get("error") === "auth";

  const [form, setForm]         = useState<LoginForm>({ email: "", password: "" });
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof LoginForm]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Client-side validation
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const errs: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LoginForm;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email:    result.data.email,
      password: result.data.password,
    });

    if (error) {
      setServerError(translateError(error.message));
      setLoading(false);
      return;
    }

    // Full page reload ensures the server reads the new session cookie
    // and all components (middleware, UserMenu, etc.) start fresh.
    const destination = redirectTo.startsWith("/") ? redirectTo : "/";
    window.location.href = destination;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group" aria-label="RwandaShop — Home">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-green-700 text-white shadow-sm group-hover:bg-green-600 transition-colors">
              <Leaf className="w-5 h-5" />
            </span>
            <span className="font-serif text-2xl font-bold">
              <span className="text-green-700">Rwanda</span>
              <span className="text-amber-500">Shop</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Sign in</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Sign in to your account.</p>
        </div>

        <div className="card p-8 space-y-6">

          {/* Registration success banner */}
          {justRegistered && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-md">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Account created! Check your email to confirm your address.</span>
            </div>
          )}

          {/* OAuth error banner */}
          {authError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Authentication failed. Please try again.</span>
            </div>
          )}

          {/* Google OAuth */}
          <GoogleButton loading={loading} />

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
              or with your email
            </div>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Server error */}
            {serverError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
                className={cn("input", fieldErrors.email && "border-red-400 focus:ring-red-500")}
                placeholder="you@example.com"
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-green-700 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className={cn("input pr-10", fieldErrors.password && "border-red-400 focus:ring-red-500")}
                  placeholder="••••••••"
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  aria-invalid={!!fieldErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-green-700 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page (Suspense required for useSearchParams) ──────────────────

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
