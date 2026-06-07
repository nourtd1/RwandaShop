import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_EMOJIS } from "@/types";
import type { Category } from "@/types";

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  return (data ?? []) as Category[];
}

const CAT_COLORS: Record<string, { card: string; icon: string; dot: string }> = {
  vannerie:   { card: "hover:bg-amber-50  hover:border-amber-200",  icon: "bg-amber-100",  dot: "bg-amber-500"  },
  sculptures: { card: "hover:bg-stone-50  hover:border-stone-200",  icon: "bg-stone-100",  dot: "bg-stone-500"  },
  textiles:   { card: "hover:bg-violet-50 hover:border-violet-200", icon: "bg-violet-100", dot: "bg-violet-500" },
  poterie:    { card: "hover:bg-orange-50 hover:border-orange-200", icon: "bg-orange-100", dot: "bg-orange-500" },
  bijoux:     { card: "hover:bg-rose-50   hover:border-rose-200",   icon: "bg-rose-100",   dot: "bg-rose-500"   },
};

const DEFAULT_COLORS = { card: "hover:bg-gray-50 hover:border-gray-200", icon: "bg-gray-100", dot: "bg-gray-400" };

export default async function CategoryBar() {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-2">Explore</p>
            <h2 id="categories-heading" className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              Our categories
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-700 transition-colors group"
          >
            Browse all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div
          className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-5 sm:overflow-visible sm:pb-0"
          role="list"
        >
          {categories.map((category) => {
            const emoji  = CATEGORY_EMOJIS[category.slug] ?? "🎨";
            const colors = CAT_COLORS[category.slug] ?? DEFAULT_COLORS;

            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                role="listitem"
                className={`group relative flex flex-col items-center gap-4 p-6 rounded-2xl border border-gray-100 bg-white shrink-0 w-40 sm:w-auto transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${colors.card}`}
              >
                {/* Decorative dot */}
                <span className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${colors.dot} opacity-30`} aria-hidden="true" />

                {/* Icon */}
                <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${colors.icon} text-3xl group-hover:scale-110 transition-transform duration-200 shadow-sm select-none`}>
                  {emoji}
                </div>

                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900 transition-colors">{category.name}</p>
                  {category.description && (
                    <p className="text-[11px] text-gray-400 mt-1 leading-snug line-clamp-2">{category.description}</p>
                  )}
                </div>

                <span className="flex items-center gap-1 text-[11px] font-semibold text-green-700 opacity-0 group-hover:opacity-100 -mt-1 transition-opacity">
                  Discover <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link href="/products" className="text-sm font-medium text-green-700 hover:underline">
            View all products →
          </Link>
        </div>
      </div>
    </section>
  );
}
