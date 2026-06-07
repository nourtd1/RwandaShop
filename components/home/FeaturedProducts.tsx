import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/types";

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*), artisan:users(id, full_name, avatar_url)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);
  return (data ?? []) as unknown as Product[];
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();
  if (products.length === 0) return null;

  return (
    <section className="bg-gray-50 py-16 sm:py-24" aria-labelledby="featured-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-green-700 text-xs font-semibold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Editor&apos;s pick
            </div>
            <h2 id="featured-heading" className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              Our most popular creations
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-700 transition-colors group"
          >
            View all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Centred CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-8 py-3.5 rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-100"
          >
            View the full collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
