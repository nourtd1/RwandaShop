"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function ProductsPagination({ currentPage, totalPages }: ProductsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  // Build visible page numbers (max 5 visible)
  function getPages(): (number | "…")[] {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "…")[] = [1];
    if (currentPage > 3) pages.push("…");
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex items-center justify-center gap-1.5 mt-12",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      {/* Précédent */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Page précédente"
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-rwanda-green-400 hover:text-rwanda-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Précédent</span>
      </button>

      {/* Pages */}
      <div className="flex items-center gap-1">
        {getPages().map((page, i) =>
          page === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 select-none">…</span>
          ) : (
            <button
              key={page}
              onClick={() => goToPage(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              className={cn(
                "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                page === currentPage
                  ? "bg-rwanda-green-700 text-white shadow-sm"
                  : "border border-gray-200 text-gray-700 hover:border-rwanda-green-400 hover:text-rwanda-green-700"
              )}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Suivant */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Page suivante"
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-rwanda-green-400 hover:text-rwanda-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
