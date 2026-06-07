"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Eye, EyeOff, Pencil, Trash2, Loader2, Package, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, getImageUrl, cn } from "@/lib/utils";
import type { CategorySlug } from "@/types";
import { ProductForm, type DbCategory, type ProductRow } from "@/components/admin/ProductForm";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { AdminToast } from "@/components/admin/AdminToast";

export default function AdminProductsPage() {
  const [products,   setProducts]   = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState<"create" | "edit" | null>(null);
  const [editing,    setEditing]    = useState<ProductRow | null>(null);
  const [deleting,   setDeleting]   = useState<ProductRow | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase
          .from("products")
          .select("*, category:categories(id, name, slug)")
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name, slug").order("name"),
      ]);
      setProducts((prods ?? []) as unknown as ProductRow[]);
      setCategories((cats ?? []) as unknown as DbCategory[]);
      setLoading(false);
    };
    void load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string, type: "ok" | "err") => setToast({ msg, type });

  const handleSaved = (product: ProductRow) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = product;
        return next;
      }
      return [product, ...prev];
    });
    setModal(null);
    setEditing(null);
    showToast(editing ? "Product updated." : "Product created.", "ok");
  };

  const handleToggleActive = async (product: ProductRow) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active, updated_at: new Date().toISOString() })
      .eq("id", product.id)
      .select("*, category:categories(id, name, slug)")
      .single();
    if (error) { showToast(error.message, "err"); return; }
    setProducts((prev) => prev.map((p) => (p.id === product.id ? (data as unknown as ProductRow) : p)));
    showToast(data.is_active ? "Product activated." : "Product deactivated.", "ok");
  };

  const handleDelete = async (product: ProductRow) => {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) { showToast(error.message, "err"); setDeleting(null); return; }
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setDeleting(null);
    showToast("Product deleted.", "ok");
  };

  const CATEGORY_LABEL: Partial<Record<CategorySlug, string>> = Object.fromEntries(
    categories.map((c) => [c.slug, c.name])
  );

  return (
    <>
      <AdminToast toast={toast} />

      {(modal === "create" || modal === "edit") && (
        <ProductForm
          categories={categories}
          initial={modal === "edit" ? (editing ?? undefined) : undefined}
          onSaved={handleSaved}
          onClose={() => { setModal(null); setEditing(null); }}
        />
      )}

      {deleting && (
        <DeleteConfirmDialog
          productName={deleting.name}
          onConfirm={() => handleDelete(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Products{!loading && <span className="ml-2 text-base font-normal text-gray-500">({products.length})</span>}
            </h2>
          </div>
          <button
            onClick={() => { setEditing(null); setModal("create"); }}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New product
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No products yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => {
                    const catSlug  = product.category?.slug;
                    const catLabel = catSlug ? (CATEGORY_LABEL[catSlug] ?? catSlug) : "—";
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                              {product.image_url ? (
                                <Image
                                  src={getImageUrl(product.image_url)}
                                  alt={product.name}
                                  width={36}
                                  height={36}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 truncate max-w-[180px]">{product.name}</p>
                              {product.is_featured && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{catLabel}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 tabular-nums">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span className={cn(
                            "font-semibold",
                            product.stock === 0 ? "text-red-600"
                            : product.stock <= 5  ? "text-amber-600"
                            : "text-gray-700"
                          )}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
                            product.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                          )}>
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => { setEditing(product); setModal("edit"); }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(product)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title={product.is_active ? "Deactivate" : "Activate"}
                            >
                              {product.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setDeleting(product)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
