import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ShippingAddress, PaymentMethod } from "@/types";

// ── Input types ───────────────────────────────────────────────────
interface OrderItemInput {
  product_id: string;
  quantity:   number;
  price:      number;   // unit price snapshot
  line_total: number;   // price × quantity
}

interface CreateOrderBody {
  items:            OrderItemInput[];
  shipping_address: ShippingAddress;
  payment_method:   PaymentMethod;
  notes:            string | null;
  total:            number;   // subtotal (without shipping)
  shipping_fee:     number;
  grand_total:      number;   // total + shipping_fee
}

// ── GET /api/orders — customer's own orders only ──────────────────
// Admin order listing lives at /api/admin/orders
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = 20;
  const from    = (page - 1) * perPage;

  const { data, error, count } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(id, name, image_url))", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count ?? 0, page, per_page: perPage });
}

// ── POST /api/orders ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  let body: CreateOrderBody;
  try {
    body = await request.json() as CreateOrderBody;
  } catch {
    return NextResponse.json({ message: "Corps de requête invalide" }, { status: 400 });
  }

  const { items, shipping_address, payment_method, notes, total, shipping_fee, grand_total } = body;

  if (!items?.length || !shipping_address || !total) {
    return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
  }

  // ── 1. Create order ───────────────────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([{
      user_id:          user.id,
      status:           "pending",
      total:            Math.round(total),
      shipping_fee:     Math.round(shipping_fee),
      grand_total:      Math.round(grand_total),
      shipping_address,
      payment_method:   payment_method ?? "cash_on_delivery",
      notes:            notes ?? null,
    }])
    .select()
    .single();

  if (orderError ?? !order) {
    return NextResponse.json(
      { message: orderError?.message ?? "Failed to create order" },
      { status: 500 }
    );
  }

  // ── 2. Create order items ─────────────────────────────────────
  const orderItems = items.map((item) => ({
    order_id:   order.id,
    product_id: item.product_id,
    quantity:   item.quantity,
    price:      Math.round(item.price),
    line_total: Math.round(item.line_total),
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    // Rollback: delete the orphaned order
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ message: itemsError.message }, { status: 500 });
  }

  // ── 3. Decrement stock (best-effort, non-atomic) ──────────────
  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single();

    if (product) {
      await supabase
        .from("products")
        .update({ stock: Math.max(0, product.stock - item.quantity) })
        .eq("id", item.product_id);
    }
  }

  return NextResponse.json({ id: order.id }, { status: 201 });
}
