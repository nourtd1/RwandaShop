"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "./FilterSidebar";
import { cn } from "@/lib/utils";

export default function FilterDrawerToggle() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [searchParams]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const activeCount = [
    searchParams.has("category"),
    searchParams.has("min_price"),
    searchParams.has("max_price"),
    searchParams.get("sort") !== null,
  ].filter(Boolean).length;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:border-rwanda-green-400 hover:text-rwanda-green-700 transition-colors"
        aria-label="Ouvrir les filtres"
        aria-expanded={open}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtres
        {activeCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rwanda-green-600 text-white text-[10px] font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden",
          "transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer panel */}
      <aside
        aria-label="Filtres produits"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl lg:hidden",
          "flex flex-col p-5",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <FilterSidebar onClose={() => setOpen(false)} />
      </aside>
    </>
  );
}
