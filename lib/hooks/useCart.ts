"use client";

import { useCallback } from "react";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";

export function useCart() {
  const store = useCartStore();

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      store.addItem(product, quantity);
    },
    [store]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      store.removeItem(productId);
    },
    [store]
  );

  const updateItemQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) {
        store.removeItem(productId);
        return;
      }
      store.updateQuantity(productId, quantity);
    },
    [store]
  );

  return {
    items: store.items,
    total: store.getTotal(),
    itemCount: store.getItemCount(),
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart: store.clearCart,
  };
}
