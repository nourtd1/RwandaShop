"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ToastState {
  visible: boolean;
  message: string;
  type: "success" | "error";
}

interface AddToCartActionsProps {
  product: Product;
}

export default function AddToCartActions({ product }: AddToCartActionsProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "", type: "success" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ visible: true, message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  }, []);

  function decrement() { setQuantity((q) => Math.max(1, q - 1)); }
  function increment() { setQuantity((q) => Math.min(product.stock, q + 1)); }

  function handleAddToCart() {
    if (product.stock === 0) return;
    addToCart(product, quantity);
    showToast(`${product.name} added to cart!`);
  }

  function handleBuyNow() {
    if (product.stock === 0) return;
    addToCart(product, quantity);
    router.push("/checkout");
  }

  const outOfStock = product.stock === 0;
  const lowStock   = product.stock > 0 && product.stock < 5;

  return (
    <div className="space-y-4">
      {/* Stock indicator */}
      <p
        className={cn(
          "text-sm font-medium",
          outOfStock ? "text-red-600" : lowStock ? "text-orange-500" : "text-rwanda-green-700"
        )}
        aria-live="polite"
      >
        {outOfStock
          ? "Out of stock"
          : lowStock
          ? `⚠️ Only ${product.stock} left in stock`
          : `✓ In stock (${product.stock} available)`}
      </p>

      {/* Quantity selector */}
      {!outOfStock && (
        <div className="flex items-center gap-4">
          <div
            className="flex items-center border border-gray-300 rounded-lg overflow-hidden"
            role="group"
            aria-label="Quantity"
          >
            <button
              onClick={decrement}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-gray-300"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span
              className="w-12 text-center text-sm font-semibold tabular-nums text-gray-900"
              aria-label={`Quantity: ${quantity}`}
            >
              {quantity}
            </span>
            <button
              onClick={increment}
              disabled={quantity >= product.stock}
              aria-label="Increase quantity"
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-l border-gray-300"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-gray-400">Max {product.stock}</p>
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm",
            "transition-all duration-150",
            outOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "btn-primary hover:scale-[1.02] active:scale-100"
          )}
          aria-label={outOfStock ? "Out of stock" : "Add to cart"}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to cart
        </button>

        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm",
            "transition-all duration-150",
            outOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-rwanda-green-50 text-rwanda-green-700 border border-rwanda-green-200 hover:bg-rwanda-green-100 hover:scale-[1.02] active:scale-100"
          )}
          aria-label="Buy now"
        >
          <Zap className="w-4 h-4" />
          Buy now
        </button>
      </div>

      {/* Toast notification */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium",
          "transition-all duration-300 ease-out",
          toast.visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-1 pointer-events-none",
          toast.type === "success"
            ? "bg-rwanda-green-50 text-rwanda-green-800 border border-rwanda-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
        )}
      >
        {toast.type === "success" && (
          <Check className="w-4 h-4 text-rwanda-green-600 shrink-0" aria-hidden="true" />
        )}
        {toast.message}
      </div>
    </div>
  );
}
