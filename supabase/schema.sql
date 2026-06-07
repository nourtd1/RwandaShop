-- ══════════════════════════════════════════════════════════════════
--  RwandaShop — Schéma Supabase (v2)
--  À exécuter dans : app.supabase.com → SQL Editor → New query
--  Ordre d'exécution : ce fichier entier, d'un coup.
-- ══════════════════════════════════════════════════════════════════

-- ── Extensions ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- recherche full-text ILIKE rapide

-- ── Fonction utilitaire updated_at (partagée) ────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ══════════════════════════════════════════════════════════════════
--  TABLE : users
--  Miroir de auth.users avec les champs métier.
--  Créé automatiquement via trigger on_auth_user_created.
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  phone       TEXT,
  -- Adresse stockée en JSONB : { line1, line2?, city, province, country }
  address     JSONB,
  role        TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'admin')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger : crée automatiquement le profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════════════════════════════════
--  TABLE : categories
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE
                CHECK (slug IN ('vannerie','sculptures','textiles','poterie','bijoux')),
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Données de référence (insérées une seule fois)
INSERT INTO public.categories (name, slug, description) VALUES
  ('Vannerie',   'vannerie',   'Corbeilles, nattes et objets tressés traditionnels'),
  ('Sculptures', 'sculptures', 'Art en bois, pierre et Imigongo'),
  ('Textiles',   'textiles',   'Tissus Kitenge, broderies et coutures artisanales'),
  ('Poterie',    'poterie',    'Céramiques et poteries traditionnelles rwandaises'),
  ('Bijoux',     'bijoux',     'Bijoux et ornements faits à la main')
ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
--  TABLE : products
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  price         NUMERIC(10,0) NOT NULL CHECK (price >= 0),
  stock         INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  -- FK vers categories (pas d'enum dans la colonne — plus flexible)
  category_id   UUID NOT NULL REFERENCES public.categories(id),
  -- Image principale
  image_url     TEXT,
  -- Galerie additionnelle (URLs)
  gallery       TEXT[] NOT NULL DEFAULT '{}',
  artisan_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  weight_grams  INT CHECK (weight_grams > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_id_idx  ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_artisan_id_idx   ON public.products(artisan_id);
CREATE INDEX IF NOT EXISTS products_featured_idx     ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS products_active_idx       ON public.products(is_active)   WHERE is_active = true;
-- Index trigram pour la recherche ILIKE performante
CREATE INDEX IF NOT EXISTS products_name_trgm_idx    ON public.products USING GIN (name gin_trgm_ops);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ══════════════════════════════════════════════════════════════════
--  TABLE : orders
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id),
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  -- Sous-total produits (sans livraison)
  total            NUMERIC(12,0) NOT NULL CHECK (total >= 0),
  -- Frais de livraison
  shipping_fee     NUMERIC(8,0)  NOT NULL DEFAULT 2000 CHECK (shipping_fee >= 0),
  -- Montant final = total + shipping_fee
  grand_total      NUMERIC(12,0) NOT NULL CHECK (grand_total >= 0),
  -- Adresse de livraison snapshot (JSONB)
  shipping_address JSONB NOT NULL,
  payment_method   TEXT NOT NULL DEFAULT 'cash_on_delivery'
                     CHECK (payment_method IN ('cash_on_delivery','mtn_momo','airtel_money')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx  ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx   ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_idx  ON public.orders(created_at DESC);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ══════════════════════════════════════════════════════════════════
--  TABLE : order_items
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id)   ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity    INT          NOT NULL CHECK (quantity > 0),
  -- Prix unitaire snapshot au moment de la commande
  price       NUMERIC(10,0) NOT NULL CHECK (price >= 0),
  -- Sous-total ligne = price × quantity (dénormalisé pour perf)
  line_total  NUMERIC(12,0) NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx   ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);

-- ══════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════════
ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper SECURITY DEFINER : lit le rôle sans déclencher le RLS (évite la récursion infinie)
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.users WHERE id = auth.uid() $$;

-- ── users ─────────────────────────────────────────────────────────
CREATE POLICY "users_read_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_admin_read_all"
  ON public.users FOR SELECT
  USING (public.get_auth_user_role() = 'admin');

-- ── categories ───────────────────────────────────────────────────
CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "categories_admin_write"
  ON public.categories FOR ALL
  USING (public.get_auth_user_role() = 'admin');

-- ── products ─────────────────────────────────────────────────────
CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "products_admin_read_all"
  ON public.products FOR SELECT
  USING (public.get_auth_user_role() = 'admin');

CREATE POLICY "products_admin_insert"
  ON public.products FOR INSERT
  WITH CHECK (public.get_auth_user_role() = 'admin');

CREATE POLICY "products_admin_update"
  ON public.products FOR UPDATE
  USING (public.get_auth_user_role() = 'admin');

CREATE POLICY "products_admin_delete"
  ON public.products FOR DELETE
  USING (public.get_auth_user_role() = 'admin');

-- ── orders ───────────────────────────────────────────────────────
CREATE POLICY "orders_own_read"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "orders_admin_read_all"
  ON public.orders FOR SELECT
  USING (public.get_auth_user_role() = 'admin');

CREATE POLICY "orders_insert_auth"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "orders_admin_update"
  ON public.orders FOR UPDATE
  USING (public.get_auth_user_role() = 'admin');

-- ── order_items ──────────────────────────────────────────────────
CREATE POLICY "order_items_own_read"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_admin_read"
  ON public.order_items FOR SELECT
  USING (public.get_auth_user_role() = 'admin');

CREATE POLICY "order_items_insert_auth"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- ══════════════════════════════════════════════════════════════════
--  STORAGE BUCKETS (à créer dans le dashboard Supabase)
-- ══════════════════════════════════════════════════════════════════
-- Bucket "products"  → public, images produits
-- Bucket "avatars"   → public, photos de profil
--
-- Dans Supabase Dashboard → Storage → New bucket :
--   Name: products | Public: ✓
--   Name: avatars  | Public: ✓

-- ══════════════════════════════════════════════════════════════════
--  SEED DATA — données de démonstration
--  Dé-commenter et adapter les UUIDs après avoir créé un compte admin
-- ══════════════════════════════════════════════════════════════════
/*
-- 1. Récupérer l'UUID de l'artisan admin :
--    SELECT id FROM public.users WHERE role = 'admin' LIMIT 1;

-- 2. Remplacer 'YOUR-ADMIN-UUID' ci-dessous :
WITH artisan AS (SELECT 'YOUR-ADMIN-UUID'::uuid AS id),
     cat_van AS (SELECT id FROM public.categories WHERE slug = 'vannerie'),
     cat_scu AS (SELECT id FROM public.categories WHERE slug = 'sculptures'),
     cat_tex AS (SELECT id FROM public.categories WHERE slug = 'textiles')
INSERT INTO public.products (name, description, price, stock, category_id, artisan_id, is_featured, is_active)
VALUES
  ('Corbeille Agaseke',
   'Corbeille traditionnelle rwandaise tressée à la main, motifs géométriques colorés. Diamètre 30cm.',
   15000, 10, (SELECT id FROM cat_van), (SELECT id FROM artisan), true, true),
  ('Panneau Imigongo',
   'Art mural traditionnel du Rwanda, motifs géométriques en relief peints en noir, blanc et rouge.',
   45000, 5, (SELECT id FROM cat_scu), (SELECT id FROM artisan), true, true),
  ('Tissu Kitenge 2m',
   'Tissu coloré aux motifs africains traditionnels, 100% coton, 2 mètres de longueur.',
   8000, 20, (SELECT id FROM cat_tex), (SELECT id FROM artisan), false, true),
  ('Set de 3 corbeilles',
   'Ensemble de trois corbeilles Agaseke de tailles différentes, idéal comme décoration.',
   35000, 7, (SELECT id FROM cat_van), (SELECT id FROM artisan), true, true),
  ('Sculpture en bois d''ébène',
   'Sculpture artisanale représentant un guerrier rwandais, bois d''ébène massif, hauteur 40cm.',
   60000, 3, (SELECT id FROM cat_scu), (SELECT id FROM artisan), false, true);
*/
