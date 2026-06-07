"use client";

import { useTransition } from "react";
import {
  X,
  ChevronDown,
  Loader2,
  MapPin,
  User as UserIcon,
  Package,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import type { Order, OrderStatus, OrderItem } from "@/types";

// ── Constants ──────────────────────────────────────────────────────

export const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending",    label: "Pending"    },
  { value: "confirmed",  label: "Confirmed"  },
  { value: "processing", label: "Processing" },
  { value: "shipped",    label: "Shipped"    },
  { value: "delivered",  label: "Delivered"  },
  { value: "cancelled",  label: "Cancelled"  },
  { value: "refunded",   label: "Refunded"   },
];

export const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending:    ["confirmed", "cancelled"],
  confirmed:  ["processing", "cancelled"],
  processing: ["shipped",   "cancelled"],
  shipped:    ["delivered"],
  delivered:  [],
  cancelled:  [],
  refunded:   [],
};

export const STATUS_BADGE: Record<OrderStatus, string> = {
  pending:    "bg-yellow-100 text-yellow-800",
  confirmed:  "bg-blue-100  text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped:    "bg-purple-100 text-purple-800",
  delivered:  "bg-green-100  text-green-800",
  cancelled:  "bg-red-100    text-red-600",
  refunded:   "bg-gray-100   text-gray-600",
};

// ── Types ──────────────────────────────────────────────────────────

export interface CustomerProfile {
  id:        string;
  full_name: string;
  email:     string;
  phone:     string | null;
}

export interface OrderRow extends Omit<Order, "items" | "customer"> {
  customer?:    CustomerProfile;
  order_items?: (OrderItem & { product?: { id: string; name: string; image_url: string | null } })[];
}

// ── Component ──────────────────────────────────────────────────────

interface OrderDetailModalProps {
  order:          OrderRow;
  onClose:        () => void;
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
}

export function OrderDetailModal({ order, onClose, onStatusChange }: OrderDetailModalProps) {
  const [pending, startTransition] = useTransition();
  const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];

  const handleStatus = (next: OrderStatus) => {
    startTransition(() => onStatusChange(order.id, next));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
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

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status + transitions */}
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
              {order.customer.phone && <p className="text-xs text-gray-500">{order.customer.phone}</p>}
            </div>
          )}

          {/* Delivery */}
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

// ── Inline status select (table row) ──────────────────────────────

interface InlineStatusSelectProps {
  order:    OrderRow;
  onChange: (orderId: string, next: OrderStatus) => Promise<void>;
}

export function InlineStatusSelect({ order, onChange }: InlineStatusSelectProps) {
  const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];

  if (allowed.length === 0) {
    return (
      <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold", STATUS_BADGE[order.status])}>
        {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <select
        value={order.status}
        onChange={(e) => onChange(order.id, e.target.value as OrderStatus)}
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
  );
}
