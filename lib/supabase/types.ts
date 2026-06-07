// ─────────────────────────────────────────────────────────────────
//  Types Supabase Database — générés manuellement puis maintenus.
//  Pour regénérer automatiquement : npx supabase gen types typescript
//  --project-id <ref> --schema public > lib/supabase/types.ts
// ─────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Enums partagés ────────────────────────────────────────────────

type UserRole       = "customer" | "admin";
type CategorySlug   = "vannerie" | "sculptures" | "textiles" | "poterie" | "bijoux";
type OrderStatus    = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
type PaymentMethod  = "cash_on_delivery" | "mtn_momo" | "airtel_money";
type Province       = "Kigali" | "Nord" | "Sud" | "Est" | "Ouest";

// ── Shipping address JSON shape ───────────────────────────────────
interface ShippingAddressJson {
  full_name:     string;
  phone:         string;
  address_line1: string;
  address_line2: string | null;
  city:          string;
  province:      Province;
  country:       "Rwanda";
}

// ── UserAddress JSON shape ────────────────────────────────────────
interface UserAddressJson {
  line1:    string;
  line2?:   string;
  city:     string;
  province: Province;
  country:  "Rwanda";
}

// ─────────────────────────────────────────────────────────────────
//  Database interface
// ─────────────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {

      // ── users ────────────────────────────────────────────────
      users: {
        Row: {
          id:          string;
          email:       string;
          full_name:   string;
          phone:       string | null;
          address:     UserAddressJson | null;
          role:        UserRole;
          avatar_url:  string | null;
          created_at:  string;
          updated_at:  string;
        };
        Insert: {
          id?:         string;
          email:       string;
          full_name:   string;
          phone?:      string | null;
          address?:    UserAddressJson | null;
          role?:       UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?:         string;
          email?:      string;
          full_name?:  string;
          phone?:      string | null;
          address?:    UserAddressJson | null;
          role?:       UserRole;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── categories ───────────────────────────────────────────
      categories: {
        Row: {
          id:          string;
          name:        string;
          slug:        CategorySlug;
          description: string | null;
          image_url:   string | null;
          created_at:  string;
        };
        Insert: {
          id?:          string;
          name:         string;
          slug:         CategorySlug;
          description?: string | null;
          image_url?:   string | null;
          created_at?:  string;
        };
        Update: {
          id?:          string;
          name?:        string;
          slug?:        CategorySlug;
          description?: string | null;
          image_url?:   string | null;
        };
        Relationships: [];
      };

      // ── products ─────────────────────────────────────────────
      products: {
        Row: {
          id:           string;
          name:         string;
          description:  string;
          price:        number;
          stock:        number;
          category_id:  string;
          image_url:    string | null;
          gallery:      string[];
          artisan_id:   string;
          is_featured:  boolean;
          is_active:    boolean;
          weight_grams: number | null;
          created_at:   string;
          updated_at:   string;
        };
        Insert: {
          id?:           string;
          name:          string;
          description:   string;
          price:         number;
          stock?:        number;
          category_id:   string;
          image_url?:    string | null;
          gallery?:      string[];
          artisan_id:    string;
          is_featured?:  boolean;
          is_active?:    boolean;
          weight_grams?: number | null;
          created_at?:   string;
          updated_at?:   string;
        };
        Update: {
          id?:           string;
          name?:         string;
          description?:  string;
          price?:        number;
          stock?:        number;
          category_id?:  string;
          image_url?:    string | null;
          gallery?:      string[];
          artisan_id?:   string;
          is_featured?:  boolean;
          is_active?:    boolean;
          weight_grams?: number | null;
          updated_at?:   string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      // ── orders ───────────────────────────────────────────────
      orders: {
        Row: {
          id:               string;
          user_id:          string;
          status:           OrderStatus;
          total:            number;
          shipping_fee:     number;
          grand_total:      number;
          shipping_address: ShippingAddressJson;
          payment_method:   PaymentMethod;
          notes:            string | null;
          created_at:       string;
          updated_at:       string;
        };
        Insert: {
          id?:               string;
          user_id:           string;
          status?:           OrderStatus;
          total:             number;
          shipping_fee?:     number;
          grand_total:       number;
          shipping_address:  ShippingAddressJson;
          payment_method?:   PaymentMethod;
          notes?:            string | null;
          created_at?:       string;
          updated_at?:       string;
        };
        Update: {
          id?:               string;
          user_id?:          string;
          status?:           OrderStatus;
          total?:            number;
          shipping_fee?:     number;
          grand_total?:      number;
          shipping_address?: ShippingAddressJson;
          payment_method?:   PaymentMethod;
          notes?:            string | null;
          updated_at?:       string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      // ── order_items ──────────────────────────────────────────
      order_items: {
        Row: {
          id:         string;
          order_id:   string;
          product_id: string;
          quantity:   number;
          price:      number;
          line_total: number;
        };
        Insert: {
          id?:        string;
          order_id:   string;
          product_id: string;
          quantity:   number;
          price:      number;
          line_total: number;
        };
        Update: {
          id?:        string;
          order_id?:  string;
          product_id?:string;
          quantity?:  number;
          price?:     number;
          line_total?:number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      user_role:      { customer: "customer"; admin: "admin" };
      category_slug:  CategorySlug;
      order_status:   OrderStatus;
      payment_method: PaymentMethod;
      province:       Province;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ── Helpers de type pour les Row Supabase ─────────────────────────

type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type DbUser        = Tables<"users">;
export type DbCategory    = Tables<"categories">;
export type DbProduct     = Tables<"products">;
export type DbOrder       = Tables<"orders">;
export type DbOrderItem   = Tables<"order_items">;
