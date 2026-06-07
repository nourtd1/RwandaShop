import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function POST(request: NextRequest) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { supabase, user } = result;

  const raw = await request.text();
  const body = JSON.parse(raw) as Record<string, unknown>;
  const insert = { ...body, artisan_id: user.id };

  const { data, error } = await supabase
    .from("products")
    .insert([insert as never])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { supabase } = result;

  const { id, ...updates } = (await request.json()) as Record<string, unknown>;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ message: "Missing product id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { supabase } = result;

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Missing product id" }, { status: 400 });
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return new NextResponse(null, { status: 204 });
}
