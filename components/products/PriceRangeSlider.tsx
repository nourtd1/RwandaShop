"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useTransition, useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";

const MIN_PRICE = 0;
const MAX_PRICE = 100_000;
const DEBOUNCE_MS = 400;

export default function PriceRangeSlider() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [min, setMin] = useState(
    Number(searchParams.get("min_price") ?? MIN_PRICE)
  );
  const [max, setMax] = useState(
    Number(searchParams.get("max_price") ?? MAX_PRICE)
  );

  useEffect(() => {
    setMin(Number(searchParams.get("min_price") ?? MIN_PRICE));
    setMax(Number(searchParams.get("max_price") ?? MAX_PRICE));
  }, [searchParams]);

  function pushRange(nextMin: number, nextMax: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextMin > MIN_PRICE) {
        params.set("min_price", String(nextMin));
      } else {
        params.delete("min_price");
      }
      if (nextMax < MAX_PRICE) {
        params.set("max_price", String(nextMax));
      } else {
        params.delete("max_price");
      }
      params.delete("page");
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }, DEBOUNCE_MS);
  }

  function handleMin(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(Number(e.target.value), max - 1000);
    setMin(v);
    pushRange(v, max);
  }

  function handleMax(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.max(Number(e.target.value), min + 1000);
    setMax(v);
    pushRange(min, v);
  }

  const minPct = ((min - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPct = ((max - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="font-medium tabular-nums">{formatPrice(min)}</span>
        <span className="font-medium tabular-nums">{formatPrice(max)}</span>
      </div>

      {/* Double range track */}
      <div className="relative h-5 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 bg-gray-200 rounded-full" />
        {/* Active range fill */}
        <div
          className="absolute h-1.5 bg-rwanda-green-500 rounded-full"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={1000}
          value={min}
          onChange={handleMin}
          aria-label="Prix minimum"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Max thumb (overlaid) */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={1000}
          value={max}
          onChange={handleMax}
          aria-label="Prix maximum"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />

        {/* Visual thumbs */}
        <div
          className="absolute w-4 h-4 bg-white border-2 border-rwanda-green-600 rounded-full shadow-sm pointer-events-none z-30"
          style={{ left: `calc(${minPct}% - 8px)` }}
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-rwanda-green-600 rounded-full shadow-sm pointer-events-none z-30"
          style={{ left: `calc(${maxPct}% - 8px)` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <span>{formatPrice(MIN_PRICE)}</span>
        <span>{formatPrice(MAX_PRICE)}</span>
      </div>
    </div>
  );
}
