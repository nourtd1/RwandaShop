-- ══════════════════════════════════════════════════════════════════
--  RwandaShop — Données de démonstration (seed)
--
--  PRÉ-REQUIS :
--    1. Avoir exécuté database/schema.sql au préalable.
--    2. Créer un compte admin dans Supabase Auth puis récupérer
--       son UUID :  SELECT id FROM public.users WHERE role = 'admin' LIMIT 1;
--    3. Remplacer ADMIN_UUID ci-dessous par cet UUID réel.
--
--  EXÉCUTION :
--    Supabase Dashboard → SQL Editor → New query → coller + Run
-- ══════════════════════════════════════════════════════════════════

-- ── Paramètre : UUID de l'artisan/admin qui possède les produits ──
-- Remplacer par l'UUID réel de votre compte admin.
\set ADMIN_UUID 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'

-- ══════════════════════════════════════════════════════════════════
--  1. CATÉGORIES (5 catégories artisanat rwandais)
-- ══════════════════════════════════════════════════════════════════
INSERT INTO public.categories (id, name, slug, description) VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'Vannerie',
    'vannerie',
    'Corbeilles Agaseke, nattes et objets tressés à la main — art traditionnel rwandais par excellence.'
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    'Sculptures',
    'sculptures',
    'Art mural Imigongo, sculptures en bois et en pierre inspirées du patrimoine rwandais.'
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    'Textiles',
    'textiles',
    'Tissus Kitenge colorés, broderies et coutures artisanales 100 % coton.'
  ),
  (
    'c1000000-0000-0000-0000-000000000004',
    'Poterie',
    'poterie',
    'Céramiques et poteries traditionnelles rwandaises, façonnées et cuites selon des techniques ancestrales.'
  ),
  (
    'c1000000-0000-0000-0000-000000000005',
    'Bijoux',
    'bijoux',
    'Bijoux et ornements faits à la main : colliers, bracelets et boucles d''oreilles en perles africaines.'
  )
ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
--  2. PRODUITS (12 produits répartis dans les 5 catégories)
--     Tous les prix sont en RWF (Franc Rwandais).
-- ══════════════════════════════════════════════════════════════════

-- ── Vannerie (3 produits) ─────────────────────────────────────────
INSERT INTO public.products
  (id, name, description, price, stock, category_id, artisan_id, is_featured, is_active)
VALUES
  (
    'p1000000-0000-0000-0000-000000000001',
    'Corbeille Agaseke — Petite',
    'Corbeille traditionnelle rwandaise tressée à la main avec des motifs géométriques colorés. Diamètre 20 cm. Idéale pour la décoration intérieure ou comme cadeau.',
    12000,
    15,
    'c1000000-0000-0000-0000-000000000001',
    :'ADMIN_UUID',
    false,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    'Corbeille Agaseke — Grande',
    'Grande corbeille Agaseke à couvercle, tressée en fibres naturelles teintes. Diamètre 35 cm, hauteur 25 cm. Symbole d''harmonie et de paix au Rwanda.',
    25000,
    8,
    'c1000000-0000-0000-0000-000000000001',
    :'ADMIN_UUID',
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000003',
    'Set de 3 Corbeilles Agaseke',
    'Ensemble de trois corbeilles Agaseke de tailles progressives (20, 28 et 35 cm). Parfait pour décorer un salon ou offrir en cadeau de mariage.',
    55000,
    5,
    'c1000000-0000-0000-0000-000000000001',
    :'ADMIN_UUID',
    true,
    true
  ),

-- ── Sculptures (2 produits) ───────────────────────────────────────
  (
    'p1000000-0000-0000-0000-000000000004',
    'Panneau Imigongo — Géométrique',
    'Art mural traditionnel du Rwanda en relief, motifs géométriques peints en noir, blanc et rouge ocre. Format 40 × 40 cm, bois massif. Chaque panneau est unique.',
    48000,
    6,
    'c1000000-0000-0000-0000-000000000002',
    :'ADMIN_UUID',
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000005',
    'Sculpture Guerrier Rwandais',
    'Sculpture artisanale en bois d''ébène représentant un guerrier rwandais en armure traditionnelle. Hauteur 45 cm, base stable en bois dur. Pièce de collection.',
    75000,
    3,
    'c1000000-0000-0000-0000-000000000002',
    :'ADMIN_UUID',
    false,
    true
  ),

-- ── Textiles (3 produits) ─────────────────────────────────────────
  (
    'p1000000-0000-0000-0000-000000000006',
    'Tissu Kitenge — 2 mètres',
    'Tissu wax africain aux motifs traditionnels multicolores, 100 % coton. Largeur 110 cm, longueur 2 m. Idéal pour confectionner une robe, un boubou ou des coussins.',
    9500,
    25,
    'c1000000-0000-0000-0000-000000000003',
    :'ADMIN_UUID',
    false,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000007',
    'Sac à main Kitenge brodé',
    'Sac à main artisanal confectionné en tissu Kitenge, doublure en coton, fermeture à glissière. Dimensions : 30 × 25 × 8 cm. Bandoulière réglable.',
    18000,
    12,
    'c1000000-0000-0000-0000-000000000003',
    :'ADMIN_UUID',
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000008',
    'Nappe de table brodée',
    'Nappe rectangulaire 140 × 220 cm, tissu coton blanc brodé à la main de motifs floraux rwandais. Lavable en machine à 40 °C.',
    32000,
    7,
    'c1000000-0000-0000-0000-000000000003',
    :'ADMIN_UUID',
    false,
    true
  ),

-- ── Poterie (2 produits) ──────────────────────────────────────────
  (
    'p1000000-0000-0000-0000-000000000009',
    'Vase en poterie noire — Moyen',
    'Vase en argile façonné à la main selon les techniques ancestrales rwandaises, cuit au bois. Hauteur 28 cm, finition noire fumée. Décoration ou usage comme vase à fleurs.',
    22000,
    10,
    'c1000000-0000-0000-0000-000000000004',
    :'ADMIN_UUID',
    false,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000010',
    'Service à thé en céramique (6 pièces)',
    'Service à thé artisanal composé d''une théière et cinq tasses, céramique rouge décorée de motifs géométriques. Cuisson haute température, résistant au lave-vaisselle.',
    65000,
    4,
    'c1000000-0000-0000-0000-000000000004',
    :'ADMIN_UUID',
    true,
    true
  ),

-- ── Bijoux (2 produits) ───────────────────────────────────────────
  (
    'p1000000-0000-0000-0000-000000000011',
    'Collier en perles d''Afrique — Multicolore',
    'Collier long (80 cm) réalisé à la main avec des perles de verre recyclé de couleurs vives. Fermoir en laiton. Chaque collier est une pièce unique.',
    14000,
    20,
    'c1000000-0000-0000-0000-000000000005',
    :'ADMIN_UUID',
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000012',
    'Bracelet tressé en cuir et perles',
    'Bracelet artisanal en cuir naturel tressé, serti de perles en os et en cuivre. Taille unique ajustable. Fabriqué par des artisans de Kigali.',
    7500,
    30,
    'c1000000-0000-0000-0000-000000000005',
    :'ADMIN_UUID',
    false,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
--  RÉSUMÉ
-- ══════════════════════════════════════════════════════════════════
--  Catégories insérées : 5
--    • vannerie   → 3 produits (12 000 – 55 000 RWF)
--    • sculptures → 2 produits (48 000 – 75 000 RWF)
--    • textiles   → 3 produits  (9 500 – 32 000 RWF)
--    • poterie    → 2 produits (22 000 – 65 000 RWF)
--    • bijoux     → 2 produits  (7 500 – 14 000 RWF)
--  Total produits : 12
--  Produits mis en avant (is_featured) : 6
-- ══════════════════════════════════════════════════════════════════
