# ══════════════════════════════════════════════════════════════════════════════
#  RwandaShop — Dockerfile multi-stage optimisé pour Next.js 14 (standalone)
#
#  Architecture en 3 étapes :
#    deps    → installe uniquement les dépendances npm (couche mise en cache)
#    builder → compile l'application Next.js (code + assets)
#    runner  → image finale légère, sans sources ni devDeps (~150 MB au lieu de 1+ GB)
#
#  Principes de sécurité appliqués :
#    - Image de base minimale (Alpine Linux)
#    - Utilisateur non-root (nextjs:1001) — le container ne peut pas écrire sur l'hôte
#    - Aucun secret dans l'image : les variables NEXT_PUBLIC_* sont injectées
#      via ARG au build, les clés privées sont injectées au runtime via ENV
#    - Labels OCI (traçabilité image)
#
#  Utilisation :
#    docker build \
#      --build-arg NEXT_PUBLIC_SUPABASE_URL=https://... \
#      --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
#      -t ghcr.io/votre-org/rwandashop:latest .
# ══════════════════════════════════════════════════════════════════════════════

# ── Image de base partagée ────────────────────────────────────────────────────
# node:20-alpine = Node.js LTS sur Alpine Linux (image ~50 MB vs ~900 MB debian)
FROM node:20-alpine AS base

# ── Stage 1 : deps ────────────────────────────────────────────────────────────
# Objectif : installer TOUTES les dépendances (dev + prod) dans une couche isolée.
# Séparé du builder pour que Docker réutilise cette couche en cache tant que
# package-lock.json n'a pas changé → rebuild 10× plus rapide.
FROM base AS deps

# libc6-compat : compatibilité glibc pour certains modules natifs (ex: sharp)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copier uniquement les fichiers de manifeste — pas le code source.
# Docker n'invalidera le cache de cette couche que si ces fichiers changent.
COPY package.json package-lock.json* ./

# npm ci = installation déterministe depuis le lock file (pas npm install)
# --frozen-lockfile garantit la reproductibilité entre les environnements
RUN npm ci --frozen-lockfile

# ── Stage 2 : builder ─────────────────────────────────────────────────────────
# Objectif : compiler l'application Next.js en mode production.
# Le résultat "standalone" ne contient que le strict minimum pour faire tourner
# le serveur (pas de node_modules inutiles).
FROM base AS builder

WORKDIR /app

# Récupère les node_modules du stage deps (pas besoin de les réinstaller)
COPY --from=deps /app/node_modules ./node_modules

# Copie le code source complet
COPY . .

# ── Variables publiques injectées au BUILD ──────────────────────────────────
# Ces variables sont embarquées dans les bundles JS côté client par Next.js.
# Elles doivent donc être connues à la compilation, pas au runtime.
# ⚠  NE JAMAIS mettre de clés privées ici (SUPABASE_SERVICE_ROLE_KEY, etc.)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL=https://rwandashop.rw
ARG NEXT_PUBLIC_APP_NAME=RwandaShop
ARG NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD=20000
ARG NEXT_PUBLIC_SHIPPING_FEE=2000
ARG NEXT_PUBLIC_STORAGE_BUCKET_PRODUCTS=products
ARG NEXT_PUBLIC_STORAGE_BUCKET_AVATARS=avatars
ARG NEXT_PUBLIC_AUTH_REDIRECT_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD=$NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD
ENV NEXT_PUBLIC_SHIPPING_FEE=$NEXT_PUBLIC_SHIPPING_FEE
ENV NEXT_PUBLIC_STORAGE_BUCKET_PRODUCTS=$NEXT_PUBLIC_STORAGE_BUCKET_PRODUCTS
ENV NEXT_PUBLIC_STORAGE_BUCKET_AVATARS=$NEXT_PUBLIC_STORAGE_BUCKET_AVATARS
ENV NEXT_PUBLIC_AUTH_REDIRECT_URL=$NEXT_PUBLIC_AUTH_REDIRECT_URL

# Désactive la télémétrie Next.js (données envoyées à Vercel)
ENV NEXT_TELEMETRY_DISABLED=1

# Lance la compilation Next.js.
# next.config.ts a `output: "standalone"` → génère .next/standalone/
# qui est un serveur Node.js autonome sans node_modules inutiles.
RUN npm run build

# ── Stage 3 : runner ──────────────────────────────────────────────────────────
# Image finale : contient uniquement les fichiers nécessaires à l'exécution.
# Pas de sources, pas de devDependencies, pas d'outils de compilation.
FROM base AS runner

# Métadonnées OCI — bonnes pratiques pour la traçabilité des images en prod
LABEL org.opencontainers.image.title="RwandaShop"
LABEL org.opencontainers.image.description="Marketplace artisanat rwandais — UNILAK"
LABEL org.opencontainers.image.source="https://github.com/votre-org/rwandashop"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Passe en mode production Node.js (désactive les avertissements dev, optimise les performances)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# ── Variables privées : injectées au RUNTIME (pas dans l'image) ─────────────
# Ces variables n'ont pas de valeur par défaut ici — elles DOIVENT être fournies
# via `docker run -e` ou le fichier .env du docker-compose.
# Exemples :  SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET
# Déclarer les ENV sans valeur permet à des outils d'introspection de savoir
# quelles variables le container attend.
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ── Création de l'utilisateur non-root ──────────────────────────────────────
# Principe de sécurité : le processus Node.js tourne avec le minimum de privilèges.
# GID 1001 / UID 1001 sont standard pour les images Next.js officielles.
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copie des assets statiques publics (images, fonts, manifest…)
COPY --from=builder /app/public ./public

# Copie du serveur standalone généré par Next.js
# --chown assigne la propriété à l'utilisateur nextjs dès la copie
# (plus performant que RUN chown car évite une couche supplémentaire)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Basculement vers l'utilisateur non-root
USER nextjs

# Expose le port — documentation uniquement (pas de mappage réseau)
EXPOSE 3000

# Health check intégré à l'image.
# Docker (et docker-compose) interroge cet endpoint toutes les 30 s.
# Après 3 échecs consécutifs → container marqué "unhealthy".
# L'endpoint /api/health est défini dans app/api/health/route.ts
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Commande de démarrage : server.js est généré par `output: "standalone"`
CMD ["node", "server.js"]
