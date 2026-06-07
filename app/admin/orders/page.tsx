"use client";

import { useEffect, useState, useTransition } from "react";
import {
  X,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  MapPin,
  User as UserIcon,
  Package,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, cn } from "@/lib/utils";
import type { Order, OrderStatus, OrderItem } from "@/types";

// ── Constants ─────────────────────────────────────────────────────

type StatusFilter = OrderStatus | "all";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending",    label: "Pending"    },
  { value: "confirmed",  label: "Confirmed"  },
  { value: "processing", label: "Processing" },
  { value: "shipped",    label: "Shipped"    },
  { value: "delivered",  label: "Delivered"  },
  { value: "cancelled",  label: "Cancelled"  },
  { value: "refunded",   label: "Refunded"   },
];

// Allowed status transitions (linear progression)
const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending:    ["confirmed", "cancelled"],
  confirmed:  ["processing", "cancelled"],
  processing: ["shipped",   "cancelled"],
  shipped:    ["delivered"],
  delivered:  [],
  cancelled:  [],
  refunded:   [],
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending:    "bg-yellow-100 text-yellow-800",
  confirmed:  "bg-blue-100  text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped:    "bg-purple-100 text-purple-800",
  delivered:  "bg-green-100  text-green-800",
  cancelled:  "bg-red-100    text-red-600",
  refunded:   "bg-gray-100   text-gray-600",
};

// ── Types ─────────────────────────────────────────────────────────

interface CustomerProfile {
  id:        string;
  full_name: string;
  email:     string;
  phone:     string | null;
}

interface OrderRow extends Omit<Order, "items" | "customer"> {
  customer?:    CustomerProfile;
  order_items?: (OrderItem & { product?: { id: string; name: string; image_url: string | null } })[];
}

// ── Order detail modal ────────────────────────────────────────────

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order:          OrderRow;
  onClose:        () => void;
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const allowed  = ALLOWED_TRANSITIONS[order.status] ?? [];

  const handleStatus = (next: OrderStatus) => {
    startTransition(() => onStatusChange(order.id, next));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Current status + transitions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", STATUS_BADGE[order.status])}>
                {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status}
              </span>
            </div>
            {allowed.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {allowed.map((next) => (
                  <button
                    key={next}
                    onClick={() => handleStatus(next)}
                    disabled={pending}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      "border-gray-200 text-gray-700 hover:border-green-500 hover:text-green-700 hover:bg-green-50",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {pending && <Loader2 className="w-3 h-3 animate-spin" />}
                    → {STATUS_OPTIONS.find((s) => s.value === next)?.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer */}
          {order.customer && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{order.customer.full_name}</p>
              <p className="text-xs text-gray-500">{order.customer.email}</p>
              {order.customer.phone && (
                <p className="text-xs text-gray-500">{order.customer.phone}</p>
              )}
            </div>
          )}

          {/* Delivery address */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery</span>
            </div>
            {order.shipping_address && (
              <>
                <p className="text-sm font-medium text-gray-900">{order.shipping_address.full_name}</p>
                <p className="text-xs text-gray-600">{order.shipping_address.phone}</p>
                <p className="text-xs text-gray-600">{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && (
                  <p className="text-xs text-gray-600">{order.shipping_address.address_line2}</p>
                )}
                <p className="text-xs text-gray-600">
                  {order.shipping_address.city}, {order.shipping_address.province} — {order.shipping_address.country}
                </p>
              </>
            )}
          </div>

          {/* Items */}
          {(order.order_items ?? []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Items ({order.order_items!.length})
                </span>
              </div>
              <ul className="space-y-2">
                {order.order_items!.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800 truncate">
                        {item.product?.name ?? `Product ${item.product_id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 tabular-nums shrink-0">
                      {formatPrice(item.line_total)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Totals */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery</span>
              <span className="tabular-nums">{formatPrice(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(order.grand_total)}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
              <span className="font-semibold">Note: </span>{order.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<StatusFilter>("all");
  const [detail,  setDetail]  = useState<OrderRow | null>(null);
  const [toast,   setToast]   = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Initial load
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("*, customer:users(id, full_name, email, phone), order_items(*, product:products(id, name, image_url))")
        .order("created_at", { ascending: false });
      setOrders((data ?? []) as unknown as OrderRow[]);
      setLoading(false);
    };
    void load();
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string, type: "ok" | "err") => setToast({ msg, type });

  // Status change
  const handleStatusChange = async (orderId: string, next: OrderStatus) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select("*, customer:users(id, full_name, email, phone), order_items(*, product:products(id, name, image_url))")
      .single();

    if (error) { showToast(error.message, "err"); return; }

    const updated = data as unknown as OrderRow;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    setDetail(updated);
    showToast("Status updated.", "ok");
  };

  // Inline status change (select in table)
  const handleInlineStatus = async (order: OrderRow, next: OrderStatus) => {
    await handleStatusChange(order.id, next);
  };

  const filtered = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up",
          toast.type === "ok" ? "bg-green-700 text-white" : "bg-red-600 text-white"
        )}>
          {toast.type === "ok"
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle  className="w-4 h-4 shrink-0" />
          }
          {toast.msg}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <OrderDetailModal
          order={detail}
          onClose={() => setDetail(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <div className="space-y-5">
        {/* Header + filters */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900">
            Orders
            {!loading && (
              <span className="ml-2 text-base font-normal text-gray-500">
                ({filtered.length}{filter !== "all" ? ` / ${orders.length}` : ""})
              </span>
            )}
          </h2>

          {/* Status filter */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as StatusFilter)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">
                  {filter === "all" ? "No orders yet." : "No orders with this status."}
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ref.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((order) => {
                    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        {/* Ref */}
                        <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        {/* Customer */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{order.customer?.full_name ?? "—"}</p>
                          <p className="text-xs text-gray-400">{order.customer?.email ?? ""}</p>
                        </td>
                        {/* Total */}
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                          {formatPrice(order.grand_total)}
                        </td>
                        {/* Status — inline select */}
                        <td className="px-4 py-3 text-center">
                          {allowed.length > 0 ? (
                            <div className="relative inline-block">
                              <select
                                value={order.status}
                                onChange={(e) => handleInlineStatus(order, e.target.value as OrderStatus)}
                                className={cn(
                                  "appearance-none pl-2.5 pr-6 py-0.5 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500",
                                  STATUS_BADGE[order.status]
                                )}
                              >
                                <option value={order.status}>
                                  {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status}
                                </option>
                                {allowed.map((next) => (
                                  <option key={next} value={next}>
                                    {STATUS_OPTIONS.find((s) => s.value === next)?.label ?? next}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3" />
                            </div>
                          ) : (
                            <span className={cn(
                              "inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold",
                              STATUS_BADGE[order.status]
                            )}>
                              {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status}
                            </span>
                          )}
                        </td>
                        {/* Date */}
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setDetail(order)}
                            className="text-xs font-medium text-green-700 hover:underline px-2 py-1 rounded hover:bg-green-50 transition-colors"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
