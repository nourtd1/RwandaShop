"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Leaf, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createUserProfile } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

// ── Zod schema ────────────────────────────────────────────────────

const registerSchema = z
  .object({
    first_name: z.string().min(2, "First name required (min 2 characters)").max(50),
    last_name:  z.string().min(2, "Last name required (min 2 characters)").max(50),
    email:      z.string().email("Invalid email address"),
    password:   z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "At least one uppercase letter required")
      .regex(/[0-9]/, "At least one digit required"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match.",
    path:    ["confirm_password"],
  });

type RegisterForm = z.infer<typeof registerSchema>;
type FieldErrors  = Partial<Record<keyof RegisterForm, string>>;

// ── Supabase error translation ────────────────────────────────────

function translateError(msg: string): string {
  const map: Record<string, string> = {
    "User already registered":         "An account already exists with this email.",
    "Email rate limit exceeded":        "Too many registrations from this address. Please try again later.",
    "Password should be at least":      "Password is too short (minimum 6 characters).",
    "Unable to validate email address": "Invalid email address.",
    "Signup is disabled":               "Registrations are temporarily disabled.",
  };
  for (const [key, val] of Object.entries(map)) {
    if (msg.includes(key)) return val;
  }
  return "An unexpected error occurred. Please try again.";
}

// ── Password strength indicator ───────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;

  const labels = ["Very weak", "Weak", "Medium", "Strong", "Very strong"];
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-600",
  ];

  return (
    <div className="mt-2 space-y-1" aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < score ? colors[score] : "bg-gray-200"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">{labels[score]}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    first_name:       "",
    last_name:        "",
    email:            "",
    password:         "",
    confirm_password: "",
  });
  const [showPwd, setShowPwd]   = useState(false);
  const [showCfm, setShowCfm]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof RegisterForm]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Zod validation
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const errs: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof RegisterForm;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setLoading(true);

    const fullName = `${result.data.first_name.trim()} ${result.data.last_name.trim()}`;
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email:    result.data.email,
      password: result.data.password,
      options: {
        data:        { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(translateError(error.message));
      setLoading(false);
      return;
    }

    // Create profile in the `users` table (via Server Action + admin client)
    if (data.user) {
      await createUserProfile(data.user.id, fullName, result.data.email);
    }

    // If Supabase requires email confirmation, stay on the page
    if (data.session === null) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    // Confirmation disabled → auto sign-in, redirect
    router.push("/");
    router.refresh();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full card p-8 text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
          <p className="text-gray-600 text-sm">
            A confirmation email has been sent to{" "}
            <span className="font-semibold">{form.email}</span>. Click the link
            to activate your account.
          </p>
          <Link
            href="/login"
            className="btn-primary inline-block px-6 py-2.5 mt-2"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the RwandaShop community.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Server error */}
            {serverError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* First name / Last name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={handleChange}
                  autoComplete="given-name"
                  autoFocus
                  className={cn("input", fieldErrors.first_name && "border-red-400 focus:ring-red-500")}
                  placeholder="Jean de Dieu"
                  aria-invalid={!!fieldErrors.first_name}
                />
                {fieldErrors.first_name && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.first_name}</p>
                )}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={handleChange}
                  autoComplete="family-name"
                  className={cn("input", fieldErrors.last_name && "border-red-400 focus:ring-red-500")}
                  placeholder="Uwimana"
                  aria-invalid={!!fieldErrors.last_name}
                />
                {fieldErrors.last_name && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.last_name}</p>
                )}
              </div>
            </div>

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
                className={cn("input", fieldErrors.email && "border-red-400 focus:ring-red-500")}
                placeholder="you@example.com"
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={cn("input pr-10", fieldErrors.password && "border-red-400 focus:ring-red-500")}
                  placeholder="Minimum 8 characters"
                  aria-invalid={!!fieldErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPwd ? "Hide" : "Show"}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              ) : (
                <PasswordStrength password={form.password} />
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showCfm ? "text" : "password"}
                  value={form.confirm_password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={cn("input pr-10", fieldErrors.confirm_password && "border-red-400 focus:ring-red-500")}
                  placeholder="••••••••"
                  aria-invalid={!!fieldErrors.confirm_password}
                />
                <button
                  type="button"
                  onClick={() => setShowCfm((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showCfm ? "Hide" : "Show"}
                >
                  {showCfm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirm_password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.confirm_password}</p>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-gray-700">Terms of Service</Link>
              {" "}and our{" "}
              <Link href="/privacy" className="underline hover:text-gray-700">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? "Creating account…" : "Create my account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-green-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
