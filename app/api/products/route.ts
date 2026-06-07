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

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const { data, error } = await supabase
    .from("products")
    .insert([{ ...body, artisan_id: user.id }] as Parameters<ReturnType<typeof supabase.from>["insert"]>[0])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
