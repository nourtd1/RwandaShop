"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import PriceRangeSlider from "./PriceRangeSlider";
import { CATEGORY_LABELS, CATEGORY_EMOJIS, CATEGORY_SLUGS } from "@/types";
import { cn } from "@/lib/utils";
import type { CategorySlug } from "@/types";

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest first"       },
  { value: "price_asc",  label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name_asc",   label: "Name A → Z"         },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface FilterSidebarProps {
  onClose?: () => void;
}

export default function FilterSidebar({ onClose }: FilterSidebarProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const activeCategory = searchParams.get("category") as CategorySlug | null;
  const activeSort     = (searchParams.get("sort") ?? "newest") as SortValue;

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) { params.set(key, value); } else { params.delete(key); }
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function toggleCategory(slug: CategorySlug) {
    setParam("category", activeCategory === slug ? null : slug);
    onClose?.();
  }

  function clearAll() {
    startTransition(() => router.push(pathname));
    onClose?.();
  }

  const hasFilters =
    searchParams.has("category") ||
    searchParams.has("min_price") ||
    searchParams.has("max_price") ||
    searchParams.get("sort") !== null;

  return (
    <div className="flex flex-col h-full">
      {/* Drawer header (mobile only) */}
      {onClose && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Desktop heading */}
      {!onClose && (
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">Filters</h2>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-rwanda-green-700 hover:text-rwanda-green-600 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-7">
        {/* Sort by */}
        <section aria-labelledby="sort-heading">
          <h3 id="sort-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Sort by
          </h3>
          <div className="space-y-1.5">
            {SORT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setParam("sort", value === "newest" ? null : value)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  activeSort === value
                    ? "bg-rwanda-green-50 text-rwanda-green-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <div className="border-t border-gray-100" />

        {/* Categories */}
        <section aria-labelledby="category-heading">
          <h3 id="category-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Category
          </h3>
          <div className="space-y-1">
            {CATEGORY_SLUGS.map((slug) => {
              const active = activeCategory === slug;
              return (
                <label
                  key={slug}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer select-none transition-colors",
                    active ? "bg-rwanda-green-50" : "hover:bg-gray-50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleCategory(slug)}
                    className="w-4 h-4 rounded border-gray-300 text-rwanda-green-600 focus:ring-rwanda-green-500 cursor-pointer"
                  />
                  <span className="text-base leading-none" aria-hidden="true">
                    {CATEGORY_EMOJIS[slug]}
                  </span>
                  <span className={cn(
                    "text-sm transition-colors",
                    active ? "text-rwanda-green-700 font-medium" : "text-gray-700"
                  )}>
                    {CATEGORY_LABELS[slug]}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <div className="border-t border-gray-100" />

        {/* Price range */}
        <section aria-labelledby="price-heading">
          <h3 id="price-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Price range (RWF)
          </h3>
          <PriceRangeSlider />
        </section>
      </div>

      {/* Mobile apply button */}
      {onClose && hasFilters && (
        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
          <button onClick={clearAll} className="flex-1 btn-secondary py-2.5 text-sm">
            Clear
          </button>
          <button onClick={onClose} className="flex-1 btn-primary py-2.5 text-sm">
            View results
          </button>
        </div>
      )}
    </div>
  );
}
