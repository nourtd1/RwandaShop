"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Truck, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/types";
import type { Product } from "@/types";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  // image_url est l'image principale, gallery contient les images additionnelles
  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...product.gallery,
  ];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const categoryLabel = product.category
    ? CATEGORY_LABELS[product.category.slug]
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={getImageUrl(allImages[selectedIndex] ?? null)}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={`relative flex-none w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedIndex === i ? "border-green-600" : "border-transparent"
                  }`}
                >
                  <Image
                    src={getImageUrl(img)}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            {categoryLabel && (
              <span className="text-sm font-medium text-green-700 uppercase tracking-wide">
                {categoryLabel}
              </span>
            )}
            <h1 className="mt-1 text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.artisan && (
              <p className="mt-2 text-sm text-gray-500">
                Par <span className="font-medium text-gray-700">{product.artisan.full_name}</span>
              </p>
            )}
          </div>

          <div className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div>
            {product.stock === 0 ? (
              <span className="text-red-600 font-medium">Rupture de stock</span>
            ) : (
              <span className="text-green-700 font-medium">{product.stock} en stock</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
            <button
              onClick={() => addToCart(product, quantity)}
              disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Ajouter au panier
            </button>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck className="w-5 h-5 text-green-600 flex-none" />
              <span>Delivery across Rwanda (2–5 days)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ShieldCheck className="w-5 h-5 text-green-600 flex-none" />
              <span>Certified authentic craftsmanship</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
