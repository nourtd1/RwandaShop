"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import {
  OrderDetailModal,
  InlineStatusSelect,
  STATUS_OPTIONS,
  STATUS_BADGE,
  type OrderRow,
} from "@/components/admin/OrderDetailModal";
import { AdminToast } from "@/components/admin/AdminToast";

type StatusFilter = OrderStatus | "all";

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<StatusFilter>("all");
  const [detail,  setDetail]  = useState<OrderRow | null>(null);
  const [toast,   setToast]   = useState<{ msg: string; type: "ok" | "err" } | null>(null);

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

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string, type: "ok" | "err") => setToast({ msg, type });

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

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <AdminToast toast={toast} />

      {detail && (
        <OrderDetailModal
          order={detail}
          onClose={() => setDetail(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900">
            Orders
            {!loading && (
              <span className="ml-2 text-base font-normal text-gray-500">
                ({filtered.length}{filter !== "all" ? ` / ${orders.length}` : ""})
              </span>
            )}
          </h2>

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
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{order.customer?.full_name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{order.customer?.email ?? ""}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                        {new Intl.NumberFormat("fr-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(order.grand_total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <InlineStatusSelect order={order} onChange={handleStatusChange} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setDetail(order)}
                          className="text-xs font-medium text-green-700 hover:underline px-2 py-1 rounded hover:bg-green-50 transition-colors"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
