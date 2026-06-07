import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CategorySlug } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categorySlug = searchParams.get("category") as CategorySlug | null;
  const featured = searchParams.get("featured");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "12", 10), 50);

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, category:categories(*), artisan:users(id, full_name, avatar_url)", { count: "exact" })
    .eq("is_active", true);

  if (categorySlug) query = query.eq("categories.slug", categorySlug);
  if (featured === "true") query = query.eq("is_featured", true);
  if (search) query = query.ilike("name", `%${search}%`);

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1).order("created_at", { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count ?? 0) / perPage),
  });
}

// Admin product mutations live at /api/admin/products
