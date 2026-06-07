"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check, Flame, Heart, Star } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (product.stock === 0 || added) return;
    setAdded(true);
    addToCart(product, 1);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1500);
  }

  const categoryLabel = product.category
    ? CATEGORY_LABELS[product.category.slug]
    : null;

  const isLowStock  = product.stock > 0 && product.stock < 5;
  const isOutOfStock = product.stock === 0;

  return (
    <article
      className={cn(
        "card group relative flex flex-col",
        "transition-all duration-200 ease-out",
        "hover:shadow-card-hover hover:border-rwanda-green-200 hover:-translate-y-0.5"
      )}
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
        {product.is_featured && (
          <span className="inline-flex items-center gap-1 bg-rwanda-gold-500 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm">
            <Star className="w-2.5 h-2.5 fill-white" />
            Featured
          </span>
        )}
        {isLowStock && (
          <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            <Flame className="w-2.5 h-2.5" />
            Almost sold out!
          </span>
        )}
        {isOutOfStock && (
          <span className="inline-flex items-center bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Out of stock
          </span>
        )}
      </div>

      {/* Image */}
      <Link
        href={`/products/${product.id}`}
        className="block relative aspect-square bg-rwanda-beige-50 overflow-hidden"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={getImageUrl(product.image_url)}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <Link href={`/products/${product.id}`} className="flex flex-col flex-1 gap-1 group/link">
          {categoryLabel && (
            <span className="text-[10px] font-semibold text-rwanda-green-600 uppercase tracking-widest">
              {categoryLabel}
            </span>
          )}
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover/link:text-rwanda-green-700 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
              {product.description}
            </p>
          )}
        </Link>

        {/* Price + stock */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-gray-900 tabular-nums">
            {formatPrice(product.price)}
          </span>
          {isLowStock && (
            <span className="text-[10px] text-orange-600 font-medium">
              {product.stock} left
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={isOutOfStock ? "Out of stock" : `Add ${product.name} to cart`}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium",
            "transition-all duration-150",
            added
              ? "bg-rwanda-green-600 text-white scale-95"
              : isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "btn-primary"
          )}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? "Sold out" : "Add to cart"}
            </>
          )}
        </button>

        <button
          className="p-2 rounded-md border border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200 transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}
