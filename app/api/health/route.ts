import { NextResponse } from "next/server";

// Process start timestamp — computed once at module load time
const STARTED_AT = Date.now();

// ── GET /api/health ───────────────────────────────────────────────
// Used by:
//   - Docker HEALTHCHECK (Dockerfile + docker-compose)
//   - GitHub Actions post-deploy verification
//   - External monitoring (UptimeRobot, Betterstack…)
//
// Returns 200 as long as the Next.js server responds correctly.
// Database or Supabase errors do NOT fail this check —
// the container itself is healthy even if Supabase is temporarily unavailable.
export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - STARTED_AT) / 1000);

  return NextResponse.json(
    {
      status:   "ok",
      service:  "rwandashop",
      version:  process.env.npm_package_version ?? "0.0.0",
      env:      process.env.NODE_ENV ?? "development",
      uptime_s: uptimeSeconds,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        // Prevent caching — always return a fresh response
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
