import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import type { OrderStatus } from "@/types";

export async function GET(request: NextRequest) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { supabase } = result;

  const { searchParams } = request.nextUrl;
  const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = 20;
  const from    = (page - 1) * perPage;

  const { data, error, count } = await supabase
    .from("orders")
    .select("*, customer:users(id, full_name, email, phone), order_items(*, product:products(id, name, image_url))", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count ?? 0, page, per_page: perPage });
}

export async function PATCH(request: NextRequest) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { supabase } = result;

  const { id, status } = (await request.json()) as { id?: string; status?: OrderStatus };
  if (!id || !status) {
    return NextResponse.json({ message: "Missing id or status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, customer:users(id, full_name, email, phone), order_items(*, product:products(id, name, image_url))")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
