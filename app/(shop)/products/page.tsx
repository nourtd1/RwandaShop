import { Suspense }      from "react";
import type { Metadata } from "next";
import Link              from "next/link";
import { PackageSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductCard       from "@/components/products/ProductCard";
import FilterSidebar     from "@/components/products/FilterSidebar";
import FilterDrawerToggle from "@/components/products/FilterDrawerToggle";
import SearchBar         from "@/components/products/SearchBar";
import ProductsPagination from "@/components/products/ProductsPagination";
import { CATEGORY_LABELS } from "@/types";
import type { Product, CategorySlug, ProductSortKey } from "@/types";

export const metadata: Metadata = {
  title: "Products — Rwandan Crafts",
  description:
    "Browse our full collection of Rwandan crafts: Agaseke basketry, Imigongo sculptures, Kitenge textiles, pottery and hand-made jewellery.",
};

const PER_PAGE = 12;

interface SearchParams {
  category?:  string;
  search?:    string;
  sort?:      string;
  page?:      string;
  min_price?: string;
  max_price?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

async function getProducts(params: SearchParams): Promise<{ products: Product[]; total: number }> {
  const supabase = await createClient();

  const page    = Math.max(1, Number(params.page ?? 1));
  const from    = (page - 1) * PER_PAGE;
  const to      = from + PER_PAGE - 1;
  const sortKey = (params.sort ?? "newest") as ProductSortKey;

  let query = supabase
    .from("products")
    .select("*, category:categories(*), artisan:users(id, full_name, avatar_url)", { count: "exact" })
    .eq("is_active", true);

  if (params.category) {
    query = query.eq("categories.slug", params.category as CategorySlug);
  }

  if (params.search?.trim()) {
    query = query.ilike("name", `%${params.search.trim()}%`);
  }

  if (params.min_price) query = query.gte("price", Number(params.min_price));
  if (params.max_price) query = query.lte("price", Number(params.max_price));

  switch (sortKey) {
    case "price_asc":  query = query.order("price", { ascending: true });  break;
    case "price_desc": query = query.order("price", { ascending: false }); break;
    case "name_asc":   query = query.order("name",  { ascending: true });  break;
    default:           query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, count } = await query;
  return { products: (data ?? []) as unknown as Product[], total: count ?? 0 };
}

function EmptyState({ search, category }: { search?: string; category?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-5">
        <PackageSearch className="w-8 h-8 text-gray-400" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No products found</h2>
      <p className="text-gray-500 max-w-sm mb-6 text-sm">
        {search
          ? `No results for "${search}"${category ? ` in ${CATEGORY_LABELS[category as CategorySlug] ?? category}` : ""}.`
          : "No products match your filters. Try broadening your search."}
      </p>
      <Link href="/products" className="btn-primary text-sm px-5 py-2">
        View all products
      </Link>
    </div>
  );
}

function activeSortLabel(sort?: string): string {
  switch (sort) {
    case "price_asc":  return "Price: low to high";
    case "price_desc": return "Price: high to low";
    case "name_asc":   return "Name A → Z";
    default:           return "Newest first";
  }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page   = Math.max(1, Number(params.page ?? 1));

  const { products, total } = await getProducts(params);
  const totalPages = Math.ceil(total / PER_PAGE);

  const activeCategory = params.category as CategorySlug | undefined;
  const categoryLabel  = activeCategory ? CATEGORY_LABELS[activeCategory] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
          {categoryLabel ?? "All products"}
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          {total > 0
            ? `${total} product${total > 1 ? "s" : ""} · sorted by ${activeSortLabel(params.sort)}`
            : "No products"}
        </p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Suspense fallback={<div className="flex-1 h-10 bg-gray-100 rounded-lg animate-pulse" />}>
          <SearchBar />
        </Suspense>
        <Suspense fallback={null}>
          <FilterDrawerToggle />
        </Suspense>
      </div>

      <div className="flex gap-8 items-start">
        <aside
          className="hidden lg:block w-60 shrink-0 sticky top-20 bg-white rounded-2xl border border-gray-100 shadow-card p-5"
          aria-label="Product filters"
        >
          <Suspense fallback={null}>
            <FilterSidebar />
          </Suspense>
        </aside>

        <section className="flex-1 min-w-0" aria-label="Product list">
          {products.length === 0 ? (
            <EmptyState search={params.search} category={params.category} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Suspense fallback={null}>
                <ProductsPagination currentPage={page} totalPages={totalPages} />
              </Suspense>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
