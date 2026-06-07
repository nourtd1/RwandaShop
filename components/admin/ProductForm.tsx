"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { z } from "zod";
import { X, Upload, AlertCircle, Loader2, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getImageUrl, cn } from "@/lib/utils";
import type { Product, CategorySlug } from "@/types";

// ── Types ──────────────────────────────────────────────────────────

export interface DbCategory {
  id:   string;
  name: string;
  slug: CategorySlug;
}

export type ProductRow = Omit<Product, "category"> & {
  category?: DbCategory;
};

// ── Constants ──────────────────────────────────────────────────────

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// ── Zod schema ─────────────────────────────────────────────────────

const productFormSchema = z.object({
  name:        z.string().min(2, "Name required (min 2 characters)").max(120),
  description: z.string().min(10, "Description too short (min 10 characters)").max(2000),
  price:       z.coerce.number().int("Price must be a whole number in RWF").positive("Price must be > 0"),
  stock:       z.coerce.number().int("Stock must be a whole number").min(0, "Stock must be ≥ 0"),
  category_id: z.string().uuid("Invalid category"),
  is_featured: z.boolean().default(false),
  is_active:   z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;
type FieldErrors = Partial<Record<keyof ProductFormValues, string>>;

// ── Image resize ───────────────────────────────────────────────────

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
      const ctx = canvas.getContext("2d");
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

// ── Component ──────────────────────────────────────────────────────

interface ProductFormProps {
  categories: DbCategory[];
  initial?:   ProductRow;
  onSaved:    (product: ProductRow) => void;
  onClose:    () => void;
}

export function ProductForm({ categories, initial, onSaved, onClose }: ProductFormProps) {
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

    if (imageFile) {
      setUploading(true);
      const ext  = imageFile.name.split(".").pop() ?? "jpg";
      const path = `products/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(path, imageFile, { upsert: true, contentType: imageFile.type });
      setUploading(false);
      if (uploadError) {
        setServerError(`Upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(path);
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
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
              <div
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 shrink-0 overflow-hidden cursor-pointer hover:border-green-400 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl.startsWith("http") ? getImageUrl(previewUrl) : previewUrl}
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
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product name</label>
            <input
              id="name" name="name" type="text" value={form.name} onChange={handleChange}
              className={cn("input", fieldErrors.name && "border-red-400")}
              placeholder="Traditional Agaseke basket"
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description" name="description" value={form.description} onChange={handleChange}
              rows={3} className={cn("input resize-none", fieldErrors.description && "border-red-400")}
              placeholder="Describe the product in detail…"
            />
            {fieldErrors.description && <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>}
          </div>

          {/* Price / Stock / Category */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (RWF)</label>
              <input
                id="price" name="price" type="number" min={1} value={form.price} onChange={handleChange}
                className={cn("input", fieldErrors.price && "border-red-400")}
              />
              {fieldErrors.price && <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>}
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                id="stock" name="stock" type="number" min={0} value={form.stock} onChange={handleChange}
                className={cn("input", fieldErrors.stock && "border-red-400")}
              />
              {fieldErrors.stock && <p className="mt-1 text-xs text-red-600">{fieldErrors.stock}</p>}
            </div>
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category_id" name="category_id" value={form.category_id} onChange={handleChange}
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
                  type="checkbox" name={key} checked={form[key]} onChange={handleChange}
                  className="w-4 h-4 rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  {key === "is_featured" ? "Featured product" : "Active product"}
                </span>
              </label>
            ))}
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
          <button
            type="submit" form="product-form" disabled={saving}
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
