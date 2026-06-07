"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ImageIcon,
  Package,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, getImageUrl, cn } from "@/lib/utils";
import type { Product, CategorySlug } from "@/types";

// ── Constants ─────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { value: CategorySlug; label: string }[] = [
  { value: "vannerie",   label: "Basketry"   },
  { value: "sculptures", label: "Sculptures" },
  { value: "textiles",   label: "Textiles"   },
  { value: "poterie",    label: "Pottery"    },
  { value: "bijoux",     label: "Jewellery"  },
];

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

// ── Zod schema ────────────────────────────────────────────────────

const productFormSchema = z.object({
  name:         z.string().min(2, "Name required (min 2 characters)").max(120),
  description:  z.string().min(10, "Description too short (min 10 characters)").max(2000),
  price:        z.coerce.number().int("Price must be a whole number in RWF").positive("Price must be > 0"),
  stock:        z.coerce.number().int("Stock must be a whole number").min(0, "Stock must be ≥ 0"),
  category_id:  z.string().uuid("Invalid category"),
  is_featured:  z.boolean().default(false),
  is_active:    z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;
type FieldErrors = Partial<Record<keyof ProductFormValues, string>>;

// ── Types ─────────────────────────────────────────────────────────

interface DbCategory {
  id:   string;
  name: string;
  slug: CategorySlug;
}

// `Product` from @/types already has category?: Category (global type),
// we redefine the relation to match the exact DB shape.
type ProductRow = Omit<Product, "category"> & {
  category?: DbCategory;
};

// ── Image resize ──────────────────────────────────────────────────

async function resizeImageIfNeeded(file: File, maxBytes: number): Promise<File> {
  if (file.size <= maxBytes) return file;
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas  = document.createElement("canvas");
      const ratio   = Math.sqrt(maxBytes / file.size) * 0.9;
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx     = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas 2D not available")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Resize failed")); return; }
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.82,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Invalid image")); };
    img.src = url;
  });
}

// ── Product form (modal) ──────────────────────────────────────────

interface ProductFormProps {
  categories: DbCategory[];
  initial?:   ProductRow;
  onSaved:    (product: ProductRow) => void;
  onClose:    () => void;
}

function ProductForm({ categories, initial, onSaved, onClose }: ProductFormProps) {
  const isEdit = !!initial;

  const [form, setForm] = useState<ProductFormValues>({
    name:        initial?.name        ?? "",
    description: initial?.description ?? "",
    price:       initial?.price       ?? 0,
    stock:       initial?.stock       ?? 0,
    category_id: initial?.category_id ?? (categories[0]?.id ?? ""),
    is_featured: initial?.is_featured ?? false,
    is_active:   initial?.is_active   ?? true,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(initial?.image_url ?? null);
  const [uploading, setUploading]     = useState(false);
  const [saving,    setSaving]        = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (fieldErrors[name as keyof ProductFormValues]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setServerError("Only images are accepted (JPEG, PNG, WebP).");
      return;
    }
    const resized = await resizeImageIfNeeded(file, MAX_IMAGE_BYTES);
    setImageFile(resized);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(resized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const result = productFormSchema.safeParse(form);
    if (!result.success) {
      const errs: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ProductFormValues;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setSaving(true);
    const supabase = createClient();
    let imageUrl = initial?.image_url ?? null;

    // Upload image if provided
    if (imageFile) {
      setUploading(true);
      const ext      = imageFile.name.split(".").pop() ?? "jpg";
      const path     = `products/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(path, imageFile, { upsert: true, contentType: imageFile.type });
      setUploading(false);
      if (uploadError) {
        setServerError(`Upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(path);
      imageUrl = publicUrl;
    }

    const payload = { ...result.data, image_url: imageUrl };

    if (isEdit) {
      const { data, error } = await supabase
        .from("products")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", initial.id)
        .select("*, category:categories(*)")
        .single();
      if (error) { setServerError(error.message); setSaving(false); return; }
      onSaved(data as unknown as ProductRow);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setServerError("Not authenticated."); setSaving(false); return; }
      const { data, error } = await supabase
        .from("products")
        .insert([{ ...payload, artisan_id: user.id }])
        .select("*, category:categories(*)")
        .single();
      if (error) { setServerError(error.message); setSaving(false); return; }
      onSaved(data as unknown as ProductRow);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Edit product" : "New product"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} id="product-form" className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {serverError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {serverError}
            </div>
          )}

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main image</label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 shrink-0 overflow-hidden cursor-pointer hover:border-green-400 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl.startsWith("http") ? previewUrl : previewUrl}
                    alt="Preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized={!previewUrl.startsWith("http")}
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? "Uploading…" : "Choose image"}
                </button>
                <p className="text-xs text-gray-400">JPEG, PNG, WebP — max 2 MB<br />Automatically resized if needed</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className={cn("input", fieldErrors.name && "border-red-400")}
              placeholder="Traditional Agaseke basket"
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className={cn("input resize-none", fieldErrors.description && "border-red-400")}
              placeholder="Describe the product in detail…"
            />
            {fieldErrors.description && <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>}
          </div>

          {/* Price / Stock / Category */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (RWF)</label>
              <input
                id="price"
                name="price"
                type="number"
                min={1}
                value={form.price}
                onChange={handleChange}
                className={cn("input", fieldErrors.price && "border-red-400")}
              />
              {fieldErrors.price && <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>}
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                id="stock"
                name="stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={handleChange}
                className={cn("input", fieldErrors.stock && "border-red-400")}
              />
              {fieldErrors.stock && <p className="mt-1 text-xs text-red-600">{fieldErrors.stock}</p>}
            </div>
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category_id"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className={cn("input", fieldErrors.category_id && "border-red-400")}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {fieldErrors.category_id && <p className="mt-1 text-xs text-red-600">{fieldErrors.category_id}</p>}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            {(["is_featured", "is_active"] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name={key}
                  checked={form[key]}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  {key === "is_featured" ? "Featured product" : "Active product"}
                </span>
              </label>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Saving…" : isEdit ? "Save" : "Create product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirmation dialog ────────────────────────────────────

function DeleteConfirmDialog({
  product,
  onConfirm,
  onClose,
}: {
  product: ProductRow;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Delete product</h2>
            <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          Are you sure you want to delete <span className="font-semibold">{product.name}</span>?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
          <button
            onClick={() => startTransition(() => onConfirm())}
            disabled={pending}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products,   setProducts]   = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading,    setLoading]    = useState(true);

  const [modal,   setModal]   = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [deleting, setDeleting] = useState<ProductRow | null>(null);
  const [toast,   setToast]   = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Initial load
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

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string, type: "ok" | "err") => setToast({ msg, type });

  // Save (create / edit)
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

  // Toggle is_active
  const handleToggleActive = async (product: ProductRow) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active, updated_at: new Date().toISOString() })
      .eq("id", product.id)
      .select("*, category:categories(id, name, slug)")
      .single();
    if (error) { showToast(error.message, "err"); return; }
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? (data as unknown as ProductRow) : p))
    );
    showToast(data.is_active ? "Product activated." : "Product deactivated.", "ok");
  };

  // Delete
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
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-slide-up",
            toast.type === "ok"
              ? "bg-green-700 text-white"
              : "bg-red-600 text-white"
          )}
        >
          {toast.type === "ok"
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle  className="w-4 h-4 shrink-0" />
          }
          {toast.msg}
        </div>
      )}

      {/* Modals */}
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
          product={deleting}
          onConfirm={() => handleDelete(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}

      <div className="space-y-5">
        {/* Header */}
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

        {/* Table */}
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
                    const catSlug = product.category?.slug;
                    const catLabel = catSlug ? (CATEGORY_LABEL[catSlug] ?? catSlug) : "—";
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        {/* Image + name */}
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
                            product.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-500"
                          )}>
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {/* Edit */}
                            <button
                              onClick={() => { setEditing(product); setModal("edit"); }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {/* Toggle active */}
                            <button
                              onClick={() => handleToggleActive(product)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title={product.is_active ? "Deactivate" : "Activate"}
                            >
                              {product.is_active
                                ? <EyeOff className="w-3.5 h-3.5" />
                                : <Eye    className="w-3.5 h-3.5" />
                              }
                            </button>
                            {/* Delete */}
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
