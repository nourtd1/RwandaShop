"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < images.length - 1;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-rwanda-beige-50 group">
        <Image
          key={images[selectedIndex]}
          src={getImageUrl(images[selectedIndex] ?? null)}
          alt={`${productName}${images.length > 1 ? ` — vue ${selectedIndex + 1}` : ""}`}
          fill
          priority
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Navigation arrows (visible when multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
              disabled={!hasPrev}
              aria-label="Image précédente"
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full",
                "bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center",
                "transition-all duration-150",
                hasPrev
                  ? "opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => setSelectedIndex((i) => Math.min(images.length - 1, i + 1))}
              disabled={!hasNext}
              aria-label="Image suivante"
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full",
                "bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center",
                "transition-all duration-150",
                hasNext
                  ? "opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  aria-label={`Vue ${i + 1}`}
                  aria-current={i === selectedIndex ? "true" : undefined}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-150",
                    i === selectedIndex
                      ? "bg-white w-4"
                      : "bg-white/60 hover:bg-white/90"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              aria-label={`Afficher la vue ${i + 1}`}
              aria-pressed={i === selectedIndex}
              className={cn(
                "relative flex-none w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-150",
                i === selectedIndex
                  ? "border-rwanda-green-600 shadow-sm scale-95"
                  : "border-transparent hover:border-gray-300 hover:scale-95"
              )}
            >
              <Image
                src={getImageUrl(img)}
                alt={`${productName} — miniature ${i + 1}`}
                fill
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
