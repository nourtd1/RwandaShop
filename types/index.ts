import { z } from "zod";

// ── Primitives ────────────────────────────────────────────────────

export type UUID          = string;
export type ISODateString = string;
export type RWF           = number;

// ── User ──────────────────────────────────────────────────────────

export type UserRole = "customer" | "admin";

export interface User {
  id:         UUID;
  email:      string;
  full_name:  string;
  phone:      string | null;
  address:    UserAddress | null;
  role:       UserRole;
  avatar_url: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface UserAddress {
  line1:     string;
  line2?:    string;
  city:      string;
  province:  Province;
  country:   "Rwanda";
}

export const userAddressSchema = z.object({
  line1:    z.string().min(3, "Address too short"),
  line2:    z.string().optional(),
  city:     z.string().min(2, "City required"),
  province: z.enum(["Kigali", "Nord", "Sud", "Est", "Ouest"]),
  country:  z.literal("Rwanda"),
});

export type Province = "Kigali" | "Nord" | "Sud" | "Est" | "Ouest";

// ── Category ──────────────────────────────────────────────────────

export interface Category {
  id:          UUID;
  name:        string;
  slug:        CategorySlug;
  description: string | null;
  image_url:   string | null;
  created_at:  ISODateString;
}

export type CategorySlug =
  | "vannerie"
  | "sculptures"
  | "textiles"
  | "poterie"
  | "bijoux";

export const CATEGORY_SLUGS: CategorySlug[] = [
  "vannerie",
  "sculptures",
  "textiles",
  "poterie",
  "bijoux",
];

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  vannerie:   "Basketry",
  sculptures: "Sculptures",
  textiles:   "Textiles",
  poterie:    "Pottery",
  bijoux:     "Jewellery",
};

export const CATEGORY_EMOJIS: Record<CategorySlug, string> = {
  vannerie:   "🧺",
  sculptures: "🗿",
  textiles:   "🧵",
  poterie:    "🏺",
  bijoux:     "💍",
};

// ── Product ───────────────────────────────────────────────────────

export interface Product {
  id:           UUID;
  name:         string;
  description:  string;
  price:        RWF;
  stock:        number;
  category_id:  UUID;
  category?:    Category;
  image_url:    string | null;
  gallery:      string[];
  artisan_id:   UUID;
  artisan?:     Pick<User, "id" | "full_name" | "avatar_url">;
  is_featured:  boolean;
  is_active:    boolean;
  weight_grams: number | null;
  created_at:   ISODateString;
  updated_at:   ISODateString;
}

export const productSchema = z.object({
  name:         z.string().min(2, "Name required").max(120),
  description:  z.string().min(10, "Description too short").max(2000),
  price:        z.number().int("Price must be a whole number in RWF").positive("Price must be > 0"),
  stock:        z.number().int().min(0, "Stock must be ≥ 0"),
  category_id:  z.string().uuid("Invalid category"),
  image_url:    z.string().url("Invalid image URL").nullable(),
  gallery:      z.array(z.string().url()).max(8).default([]),
  is_featured:  z.boolean().default(false),
  is_active:    z.boolean().default(true),
  weight_grams: z.number().int().positive().nullable().default(null),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// ── Cart ──────────────────────────────────────────────────────────

export interface CartItem {
  product_id: UUID;
  product:    Product;
  quantity:   number;
}

export interface Cart {
  items: CartItem[];
  total: RWF;
}

export const addToCartSchema = z.object({
  product_id: z.string().uuid(),
  quantity:   z.number().int().min(1).max(99),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

// ── Order ─────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
  refunded:   "Refunded",
};

export type PaymentMethod = "cash_on_delivery" | "mtn_momo" | "airtel_money";

export interface Order {
  id:               UUID;
  user_id:          UUID;
  customer?:        Pick<User, "id" | "full_name" | "email" | "phone">;
  items:            OrderItem[];
  status:           OrderStatus;
  total:            RWF;
  shipping_fee:     RWF;
  grand_total:      RWF;
  shipping_address: ShippingAddress;
  payment_method:   PaymentMethod;
  notes:            string | null;
  created_at:       ISODateString;
  updated_at:       ISODateString;
}

export interface OrderItem {
  id:         UUID;
  order_id:   UUID;
  product_id: UUID;
  product?:   Pick<Product, "id" | "name" | "image_url" | "category_id">;
  quantity:   number;
  price:      RWF;
  line_total: RWF;
}

// ── Shipping ──────────────────────────────────────────────────────

export interface ShippingAddress {
  full_name:     string;
  phone:         string;
  address_line1: string;
  address_line2: string | null;
  city:          string;
  province:      Province;
  country:       "Rwanda";
}

export const shippingAddressSchema = z.object({
  full_name:     z.string().min(2, "Full name required"),
  phone:         z.string().regex(/^\+?2507[2389]\d{7}$/, "Invalid Rwanda number (e.g. +250 78X XXX XXX)"),
  address_line1: z.string().min(4, "Address required"),
  address_line2: z.string().nullable().default(null),
  city:          z.string().min(2, "City required"),
  province:      z.enum(["Kigali", "Nord", "Sud", "Est", "Ouest"]),
  country:       z.literal("Rwanda").default("Rwanda"),
});

export type ShippingAddressFormValues = z.infer<typeof shippingAddressSchema>;

export const checkoutSchema = z.object({
  shipping_address: shippingAddressSchema,
  payment_method:   z.enum(["cash_on_delivery", "mtn_momo", "airtel_money"]),
  notes:            z.string().max(300).nullable().default(null),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// ── API helpers ───────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data:        T[];
  total:       number;
  page:        number;
  per_page:    number;
  total_pages: number;
}

export interface ApiSuccess<T> {
  data:     T;
  message?: string;
}

export interface ApiError {
  message:  string;
  code:     string;
  status:   number;
  details?: Record<string, string[]>;
}

// ── Filters / Query params ────────────────────────────────────────

export interface ProductFilters {
  category_id?:   UUID;
  category_slug?: CategorySlug;
  featured?:      boolean;
  active?:        boolean;
  min_price?:     RWF;
  max_price?:     RWF;
  search?:        string;
  page?:          number;
  per_page?:      number;
  sort?:          ProductSortKey;
}

export type ProductSortKey =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "name_asc";

export interface OrderFilters {
  status?:  OrderStatus;
  user_id?: UUID;
  page?:    number;
  per_page?: number;
}
