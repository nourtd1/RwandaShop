"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product, CategorySlug } from "@/types";

interface UseProductsOptions {
  category?: CategorySlug;
  featured?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
}

interface UseProductsResult {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const { category, featured, search, page = 1, perPage = 12 } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      let query = supabase
        .from("products")
        .select("*, category:categories(*), artisan:users(id, full_name, avatar_url)", { count: "exact" })
        .eq("is_active", true);

      if (category) query = query.eq("categories.slug", category);
      if (featured !== undefined) query = query.eq("is_featured", featured);
      if (search) query = query.ilike("name", `%${search}%`);

      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to).order("created_at", { ascending: false });

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      setProducts((data ?? []) as unknown as Product[]);
      setTotal(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [category, featured, search, page, perPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, total, loading, error, refetch: fetchProducts };
}
