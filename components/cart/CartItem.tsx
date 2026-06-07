"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateItemQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;
  const categoryLabel = product.category
    ? CATEGORY_LABELS[product.category.slug]
    : null;

  return (
    <li className="flex gap-4 py-5 border-b border-gray-100 last:border-0 group">
      {/* Image */}
      <Link
        href={`/products/${product.id}`}
        className="flex-none rounded-xl overflow-hidden bg-rwanda-beige-50"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="relative w-24 h-24 sm:w-28 sm:h-28">
          <Image
            src={getImageUrl(product.image_url)}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="112px"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-rwanda-green-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        {categoryLabel && (
          <p className="text-[10px] font-semibold text-rwanda-green-600 uppercase tracking-widest">
            {categoryLabel}
          </p>
        )}

        <p className="text-xs text-gray-400 tabular-nums">
          {formatPrice(product.price)} / unit
        </p>

        {/* Quantity control */}
        <div
          className="mt-1 flex items-center gap-3"
          role="group"
          aria-label={`Quantity for ${product.name}`}
        >
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => updateItemQuantity(product.id, quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-gray-200"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-10 text-center text-sm font-semibold tabular-nums text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => updateItemQuantity(product.id, quantity + 1)}
              disabled={quantity >= product.stock}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-l border-gray-200"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => removeFromCart(product.id)}
            aria-label={`Remove ${product.name} from cart`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="flex-none text-right flex flex-col items-end justify-between py-0.5">
        <p className={cn(
          "text-base font-bold tabular-nums",
          product.stock === 0 ? "text-red-500" : "text-gray-900"
        )}>
          {formatPrice(product.price * quantity)}
        </p>
        {product.stock > 0 && product.stock < 5 && (
          <p className="text-[10px] text-orange-500 font-medium">
            {product.stock} left
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-[10px] text-red-500 font-medium">Sold out</p>
        )}
      </div>
    </li>
  );
}
