"use client";

import Link from "next/link";
import { Truck, Tag } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const SHIPPING_THRESHOLD = 50_000;
export const SHIPPING_FEE       = 2_000;

export default function CartSummary() {
  const { total, itemCount } = useCart();

  const shipping             = total >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal           = total + shipping;
  const remainingForFreeShip = SHIPPING_THRESHOLD - total;
  const freeShippingApplied  = shipping === 0 && itemCount > 0;
  const progressPct          = Math.min(100, (total / SHIPPING_THRESHOLD) * 100);

  return (
    <aside className="card p-6 space-y-5 sticky top-20" aria-label="Order summary">
      <h2 className="text-lg font-semibold text-gray-900">Summary</h2>

      {/* Free shipping progress */}
      {!freeShippingApplied && remainingForFreeShip > 0 && itemCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-rwanda-green-700">
            <Truck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>
              Only{" "}
              <strong>{formatPrice(remainingForFreeShip)}</strong> away from
              free shipping!
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rwanda-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {freeShippingApplied && (
        <div className="flex items-center gap-2 text-xs font-medium text-rwanda-green-700 bg-rwanda-green-50 px-3 py-2 rounded-lg border border-rwanda-green-100">
          <Tag className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Free shipping applied!
        </div>
      )}

      {/* Line items */}
      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <dt>Subtotal ({itemCount} item{itemCount > 1 ? "s" : ""})</dt>
          <dd className="tabular-nums">{formatPrice(total)}</dd>
        </div>
        <div className="flex justify-between text-gray-600">
          <dt>Shipping</dt>
          <dd className={cn("tabular-nums", shipping === 0 && "text-rwanda-green-600 font-medium")}>
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </dd>
        </div>
      </dl>

      {/* Total */}
      <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
        <span className="font-bold text-gray-900">Total</span>
        <span className="text-xl font-bold text-gray-900 tabular-nums">
          {formatPrice(grandTotal)}
        </span>
      </div>

      {/* CTA */}
      <div className="space-y-2.5">
        <Link
          href="/checkout"
          className={cn(
            "btn-primary w-full text-center block py-3 text-sm font-semibold",
            itemCount === 0 && "opacity-50 pointer-events-none"
          )}
          aria-disabled={itemCount === 0}
        >
          Proceed to checkout — {formatPrice(grandTotal)}
        </Link>
        <Link href="/products" className="btn-secondary w-full text-center block text-sm">
          Continue shopping
        </Link>
      </div>
    </aside>
  );
}
