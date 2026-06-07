-- ══════════════════════════════════════════════════════════════════
--  RwandaShop — Schéma Supabase PostgreSQL
--  Projet : E-commerce artisanat rwandais — UNILAK
--  Exécuter dans : app.supabase.com → SQL Editor → New query
--  Ordre d'exécution : ce fichier entier en une seule fois.
-- ══════════════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- recherche ILIKE performante

-- ══════════════════════════════════════════════════════════════════
--  FONCTION UTILITAIRE : updated_at auto-update
-- ══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ══════════════════════════════════════════════════════════════════
--  TABLE : users  (miroir de auth.users avec champs métier)
--
--  Créé automatiquement via le trigger on_auth_user_created
--  lors de l'inscription via Supabase Auth.
--  Stocke le rôle (customer / admin) pour les politiques RLS.
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT         NOT NULL UNIQUE,
  full_name   TEXT         NOT NULL,
  phone       TEXT,
  -- Adresse JSONB : { line1, line2?, city, province, country }
  address     JSONB,
  role        TEXT         NOT NULL DEFAULT 'customer'
                             CHECK (role IN ('customer', 'admin')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger : peuplement automatique du profil à l'inscription
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
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE
                            CHECK (slug IN ('vannerie','sculptures','textiles','poterie','bijoux')),
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════
--  TABLE : products
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(200)  NOT NULL,
  description   TEXT          NOT NULL DEFAULT '',
  -- Prix en RWF (entier, pas de décimale)
  price         NUMERIC(10,0) NOT NULL CHECK (price > 0),
  stock         INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id   UUID          NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  image_url     TEXT,
  gallery       TEXT[]        NOT NULL DEFAULT '{}',
  artisan_id    UUID          NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  is_featured   BOOLEAN       NOT NULL DEFAULT false,
  is_active     BOOLEAN       NOT NULL DEFAULT true,
  weight_grams  INTEGER       CHECK (weight_grams > 0),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Index de performance — products
CREATE INDEX IF NOT EXISTS products_category_id_idx  ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_artisan_id_idx   ON public.products(artisan_id);
CREATE INDEX IF NOT EXISTS products_is_active_idx    ON public.products(is_active)   WHERE is_active = true;
CREATE INDEX IF NOT EXISTS products_is_featured_idx  ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS products_created_at_idx   ON public.products(created_at DESC);
-- Index trigram pour recherche ILIKE rapide
CREATE INDEX IF NOT EXISTS products_name_trgm_idx    ON public.products USING GIN (name gin_trgm_ops);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ══════════════════════════════════════════════════════════════════
--  TABLE : orders
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  status           TEXT          NOT NULL DEFAULT 'pending'
                                   CHECK (status IN (
                                     'pending','confirmed','processing',
                                     'shipped','delivered','cancelled','refunded'
                                   )),
  -- Sous-total produits (hors livraison)
  total            NUMERIC(12,0) NOT NULL CHECK (total >= 0),
  -- Frais de livraison (défaut 2 000 RWF)
  shipping_fee     NUMERIC(8,0)  NOT NULL DEFAULT 2000 CHECK (shipping_fee >= 0),
  -- Montant final = total + shipping_fee
  grand_total      NUMERIC(12,0) NOT NULL CHECK (grand_total >= 0),
  -- Adresse snapshot en JSONB : { full_name, phone, address_line1, address_line2?, city, province, country }
  shipping_address JSONB         NOT NULL,
  payment_method   TEXT          NOT NULL DEFAULT 'cash_on_delivery'
                                   CHECK (payment_method IN (
                                     'cash_on_delivery','mtn_momo','airtel_money'
                                   )),
  notes            TEXT,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Index de performance — orders
CREATE INDEX IF NOT EXISTS orders_user_id_idx    ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ══════════════════════════════════════════════════════════════════
--  TABLE : order_items
-- ══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID          NOT NULL REFERENCES public.orders(id)   ON DELETE CASCADE,
  product_id  UUID          NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity    INTEGER       NOT NULL CHECK (quantity > 0),
  -- Prix unitaire snapshot au moment de la commande
  price       NUMERIC(10,0) NOT NULL CHECK (price >= 0),
  -- Sous-total ligne = price × quantity (dénormalisé)
  line_total  NUMERIC(12,0) NOT NULL CHECK (line_total >= 0),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Index de performance — order_items
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

-- ── users ─────────────────────────────────────────────────────────
-- Chaque utilisateur lit/modifie uniquement son propre profil
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Les admins lisent tous les profils
CREATE POLICY "users_admin_select_all"
  ON public.users FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ── categories ────────────────────────────────────────────────────
-- Lecture publique (même non connecté)
CREATE POLICY "categories_public_select"
  ON public.categories FOR SELECT
  USING (true);

-- Écriture (INSERT / UPDATE / DELETE) réservée aux admins
CREATE POLICY "categories_admin_all"
  ON public.categories FOR ALL
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ── products ──────────────────────────────────────────────────────
-- Lecture publique des produits actifs
CREATE POLICY "products_public_select_active"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Les admins lisent tous les produits (y compris inactifs)
CREATE POLICY "products_admin_select_all"
  ON public.products FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "products_admin_insert"
  ON public.products FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "products_admin_update"
  ON public.products FOR UPDATE
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "products_admin_delete"
  ON public.products FOR DELETE
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ── orders ────────────────────────────────────────────────────────
-- Chaque client lit et crée ses propres commandes
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Les admins lisent toutes les commandes et peuvent les mettre à jour
CREATE POLICY "orders_admin_select_all"
  ON public.orders FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "orders_admin_update"
  ON public.orders FOR UPDATE
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ── order_items ───────────────────────────────────────────────────
-- Lecture des lignes pour le propriétaire de la commande
CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- Insertion autorisée si l'utilisateur est bien le propriétaire de la commande
CREATE POLICY "order_items_insert_own"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- Les admins lisent toutes les lignes
CREATE POLICY "order_items_admin_select_all"
  ON public.order_items FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ══════════════════════════════════════════════════════════════════
--  STORAGE BUCKETS (à créer dans le dashboard Supabase)
-- ══════════════════════════════════════════════════════════════════
--  Dashboard → Storage → New bucket :
--    • Name: products  | Public: ✓  (images produits)
--    • Name: avatars   | Public: ✓  (photos de profil)
