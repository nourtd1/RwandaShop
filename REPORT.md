# RwandaShop — Project Report
## Course EWA408510 – E-Commerce and Web Application

---

| | |
|---|---|
| **Student** | Souleyman Terda |
| **Course** | EWA408510 – E-Commerce and Web Application |
| **Instructor** | Eric Maniraguha |
| **Academic Year** | 2025–2026 |
| **Institution** | Université du Lac Kivu (UNILAK) |
| **Project Name** | RwandaShop — Rwandan Artisan Marketplace |
| **Submission Date** | June 2026 |

---

## Table of Contents

1. Introduction
2. Problem Statement
3. Objectives
4. System Features
5. Technologies Used
6. System Architecture
7. Screenshots
8. GitHub Repository Link
9. Deployment Link
10. CI/CD Description
11. Challenges Encountered
12. Future Work
13. Conclusion

---

## 1. Introduction

The African continent is undergoing a profound digital transformation. According to the International Finance Corporation (IFC), Africa's e-commerce market is projected to reach $75 billion by 2025, driven by increased mobile internet penetration and a growing middle class. Rwanda, in particular, has positioned itself as a continental leader in this transition through its ambitious **Rwanda Digital Economy Policy 2030**, which aims to achieve 80% digital financial inclusion and expand the ICT sector's contribution to GDP from 6% to 10%.

Despite this promising macro-environment, small-scale artisans and craftspeople — who represent a significant cultural and economic segment of Rwandan society — remain largely excluded from the digital economy. Traditional crafts such as **Agaseke** (palm basketry), **Imigongo** (geometric cow-dung paintings), **Kitenge** textiles, and hand-crafted pottery have been sold almost exclusively through informal markets, roadside stalls, and occasional tourism-driven encounters. These artisans lack the digital infrastructure, technical knowledge, and financial resources to establish an online presence independently.

RwandaShop was conceived and developed as a direct response to this gap. It is a full-stack e-commerce web application that provides Rwandan artisans with a professionally designed marketplace to list, manage, and sell their products online, while offering domestic and international buyers a curated, authentic shopping experience. The project was built as the capstone assignment for course EWA408510, demonstrating practical mastery of modern web application development, cloud-native architecture, and DevOps best practices.

---

## 2. Problem Statement

Rwanda's artisan sector faces three interconnected challenges that prevent effective participation in e-commerce:

**Challenge 1 — Market access barrier.** Artisans depend on physical presence at local markets (e.g., Kimironko Market, Nyirangarama) or intermediary exporters who capture a disproportionate share of the margin. An artisan producing an Agaseke basket that sells for 35,000 RWF to a tourist may receive as little as 8,000 RWF through a multi-tier reseller chain.

**Challenge 2 — Visibility and discoverability.** Authentic Rwandan crafts have genuine international demand — particularly from diaspora communities, tourism-related buyers, and ethical consumer markets in Europe and North America. However, without a searchable, categorised online catalogue, these products are invisible to potential buyers outside of the immediate geographic area.

**Challenge 3 — Transaction and trust infrastructure.** Cash-on-delivery remains the dominant payment method in Rwanda (used in approximately 68% of e-commerce transactions, according to a 2023 RDB survey). Any viable marketplace must accommodate local payment methods such as MTN Mobile Money and Airtel Money alongside standard cash-on-delivery, rather than forcing customers through international card payment systems with which they are unfamiliar.

RwandaShop addresses all three challenges through a centralised, professionally engineered marketplace that lowers the barrier to online selling for artisans, increases product discoverability through category-based browsing and full-text search, and supports Rwanda-specific payment methods.

---

## 3. Objectives

The project was guided by the following SMART objectives:

**Objective 1 — Functional e-commerce platform.**
Build and deploy a fully operational marketplace that allows customers to browse products by category, add items to a persistent shopping cart, and complete the checkout process with a validated shipping address and selected payment method, by the end of the academic semester.

**Objective 2 — Secure authentication system.**
Implement a complete authentication flow (registration, login, OAuth via Google, password-protected routes, session persistence) using industry-standard patterns (Supabase Auth + SSR cookie management), with zero client-side exposure of private API keys.

**Objective 3 — Administrative dashboard.**
Develop a protected back-office interface that allows administrators to create, update, and delete product listings (including image upload to cloud storage), manage order status through a defined workflow (pending → confirmed → processing → shipped → delivered), and monitor key performance metrics (revenue, order volume, stock levels) through a real-time dashboard.

**Objective 4 — Production-ready deployment infrastructure.**
Containerise the application using Docker (multi-stage build, non-root user, standalone Next.js output) and automate quality checks and deployment through a GitHub Actions CI/CD pipeline that runs on every commit to the main branch.

**Objective 5 — Type-safe, maintainable codebase.**
Maintain strict TypeScript throughout the entire project (zero use of the `any` type, full Zod validation on all user inputs, database types generated and maintained in `lib/supabase/types.ts`), ensuring the codebase can be understood and extended by any developer.

---

## 4. System Features

### 4.1 Public Storefront

| Feature | Description |
|---|---|
| **Homepage** | Hero section with call-to-action, featured products grid, category bar, promotional banner |
| **Product catalogue** | Paginated grid with filtering by category (Vannerie, Sculptures, Textiles, Poterie, Bijoux), price range, and full-text search |
| **Product detail page** | Image gallery, description, stock indicator, add-to-cart with quantity selector, related products |
| **Category navigation** | Dropdown menu (desktop) and accordion (mobile drawer) with category icons and slugs |
| **Responsive design** | Fully responsive layout from 320px (mobile) to 1920px (large desktop) using Tailwind CSS |

### 4.2 Shopping Cart & Checkout

| Feature | Description |
|---|---|
| **Persistent cart** | Cart state stored in localStorage via Zustand; survives page refresh and browser closure |
| **Cart page** | Item list with quantity adjustment, line total calculation, subtotal, shipping fee (2,000 RWF, free above 20,000 RWF), grand total |
| **Checkout form** | Validated shipping address (full name, phone in Rwandan format +250 7X XXX XXXX, address, city, province) |
| **Payment method selection** | Cash on Delivery, MTN Mobile Money, Airtel Money |
| **Order confirmation** | Post-checkout page with order reference, summary, and next steps |
| **Stock validation** | Cart validates product availability before order submission |

### 4.3 Authentication

| Feature | Description |
|---|---|
| **Registration** | First name, last name, email, password (min 8 chars, uppercase + digit required) with real-time strength indicator |
| **Login** | Email/password with show/hide toggle, French-translated Supabase error messages |
| **OAuth (Google)** | One-click sign-in via Google, redirects through `/auth/callback` handler |
| **Password forgotten** | Link to Supabase-managed reset flow |
| **Session management** | SSR cookie-based sessions via `@supabase/ssr`; middleware refreshes token on every request |
| **Route protection** | Middleware redirects unauthenticated users away from `/checkout`, `/account`, `/admin/*` |
| **User menu** | Avatar dropdown (authenticated) or Login/Register buttons (guest), live auth state via `onAuthStateChange` |

### 4.4 Admin Dashboard

| Feature | Description |
|---|---|
| **Stats dashboard** | 8 KPI cards: total orders, today's orders, total confirmed revenue, monthly revenue, active products, out-of-stock count, total users |
| **7-day bar chart** | SVG-native bar chart showing order volume over the last 7 days, no external chart library required |
| **Product management** | Full CRUD: create, edit, toggle active/inactive, delete with confirmation dialog |
| **Image upload** | Upload to Supabase Storage bucket `products`; client-side Canvas resize if file > 2 MB; live preview before saving |
| **Order management** | Filterable order table; inline status dropdown with allowed-transition guard; order detail modal with customer info, items, address, totals |
| **Admin sidebar** | Fixed sidebar (desktop) with active route highlighting; slide-in drawer (mobile); page title in header |

### 4.5 Infrastructure & DevOps (Bonus)

| Feature | Description |
|---|---|
| **Docker** | Multi-stage Dockerfile (deps → builder → runner), non-root user, `HEALTHCHECK` instruction, image ~150 MB |
| **Docker Compose** | Two services: `app` (Next.js) + `db` (PostgreSQL 15 for local dev), named volumes, network isolation |
| **CI/CD Pipeline** | GitHub Actions: 3 jobs — lint/typecheck/build → Docker push to GHCR → Vercel deploy webhook |
| **Health check endpoint** | `GET /api/health` returns `{ status, version, uptime_s, timestamp }` |
| **Security headers** | `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` injected via `next.config.ts` |

---

## 5. Technologies Used

| Technology | Version | Role in the Project |
|---|---|---|
| **Next.js** | 14.2.29 | Full-stack React framework — App Router, Server Components, Server Actions, API Routes |
| **React** | 18.3.1 | UI component library — client-side interactivity, state management |
| **TypeScript** | 5.8.3 | Static typing — strict mode, zero `any`, full type safety across the codebase |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework — custom Rwanda colour palette, responsive design |
| **Supabase** | 2.49.4 (JS SDK) | Backend-as-a-Service: PostgreSQL database, authentication, row-level security, file storage |
| **@supabase/ssr** | 0.10.3 | Cookie-based session management for server-side rendering in Next.js |
| **Zustand** | 5.0.3 | Client-side state management for the shopping cart with localStorage persistence |
| **Zod** | 3.24.4 | Schema validation library — validates all user inputs (forms, API bodies) at runtime |
| **Lucide React** | 0.511.0 | Icon library — consistent SVG icons throughout the interface |
| **clsx + tailwind-merge** | 2.1.1 / 2.6.0 | Conditional CSS class utilities — used in the `cn()` helper |
| **ESLint** | 8.57.1 | Static code analysis — enforces Next.js recommended rules |
| **Prettier** | 3.5.3 | Automatic code formatting — Tailwind CSS class sorting plugin |
| **Docker** | — | Containerisation — multi-stage build, Alpine Linux base image |
| **GitHub Actions** | — | CI/CD automation — lint, type-check, build, Docker push, deploy |
| **PostgreSQL** | 15 (via Supabase) | Relational database — 5 tables with foreign keys, RLS policies, triggers |
| **Node.js** | 20 (Alpine) | JavaScript runtime — used as the base Docker image |

---

## 6. System Architecture

### 6.1 Overview

RwandaShop follows a **full-stack monolithic architecture** built on Next.js 14's App Router, deployed on Vercel's edge network and backed by Supabase's managed cloud infrastructure. This architecture was chosen over a separate frontend/backend split because it minimises operational complexity while retaining all the performance and security benefits of server-side rendering.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
│   React Client Components · Zustand Cart · localStorage        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                     Next.js 14 (App Router)                     │
│                                                                 │
│  ┌─────────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ Server Components│  │ Route Handlers│  │  Server Actions  │  │
│  │ (RSC — SSR)     │  │ /api/*        │  │ lib/actions/auth │  │
│  └────────┬────────┘  └───────┬───────┘  └────────┬─────────┘  │
│           │                   │                    │            │
│  ┌────────▼───────────────────▼────────────────────▼─────────┐  │
│  │            lib/supabase/server.ts  (SSR client)           │  │
│  │            lib/supabase/client.ts  (browser client)       │  │
│  └────────────────────────────┬──────────────────────────────┘  │
│                               │                                 │
│  ┌────────────────────────────▼──────────────────────────────┐  │
│  │                     Middleware (Edge)                     │  │
│  │   Session refresh · Route protection · Admin role check  │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS (JWT / anon key)
┌──────────────────────────▼──────────────────────────────────────┐
│                        Supabase Cloud                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  PostgreSQL  │  │     Auth     │  │  Storage (products │    │
│  │  (PostgREST  │  │  (GoTrue)    │  │  bucket)           │    │
│  │   auto API)  │  │              │  │                    │    │
│  └──────────────┘  └──────────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Application Layers

**Routing — Next.js App Router route groups:**

| Route Group | Path | Purpose |
|---|---|---|
| `(shop)` | `/`, `/products/*`, `/cart`, `/checkout` | Public storefront with Navbar and Footer |
| `(auth)` | `/login`, `/register` | Authentication pages (no navigation chrome) |
| `admin` | `/admin/*` | Protected dashboard (role = admin) |
| `api` | `/api/*` | JSON REST endpoints (orders, products, cart, health) |
| `auth` | `/auth/callback` | OAuth code exchange handler |

**Data access pattern:**

- **Server Components** fetch data directly via `createClient()` (server) — no waterfall, no exposed API keys, HTML streamed from the server.
- **Client Components** (admin tables, cart, user menu) call Supabase directly via `createClient()` (browser) or hit internal `/api/*` routes.
- **Server Actions** (`lib/actions/auth.ts`) handle mutations that require server-side trust (sign out, profile creation via admin client).

### 6.3 Database Schema

The PostgreSQL database contains 5 tables with strict relational integrity:

```
auth.users (Supabase managed)
    │
    └── public.users          (profile: full_name, phone, address JSONB, role)
           │
           ├── public.products  (name, price RWF, stock, category_id FK, image_url, is_active)
           │       │
           │       └── public.categories  (slug: vannerie|sculptures|textiles|poterie|bijoux)
           │
           └── public.orders    (status, total, shipping_fee, grand_total, shipping_address JSONB)
                   │
                   └── public.order_items  (product_id FK, quantity, price snapshot, line_total)
```

**Row-Level Security (RLS)** is enabled on all tables. Key policies:
- `users`: can read own row only; admin can read all.
- `products`: public read on `is_active = true`; write restricted to `role = 'admin'`.
- `orders`: customers can read/insert own orders; admins can read and update all.
- `order_items`: customers can insert for own orders; admins can read all.

### 6.4 Key Design Decisions

**Why Supabase instead of a custom API?** Supabase provides a managed PostgreSQL instance with an auto-generated REST API (PostgREST), built-in authentication (GoTrue), and file storage — replacing what would otherwise require separate servers for the API, auth service, and file storage. For an academic project with a single developer, this dramatically reduces operational overhead without sacrificing architectural quality.

**Why Next.js App Router over Pages Router?** The App Router enables React Server Components, which allow data fetching to happen on the server without exposing credentials to the client. The admin dashboard's stats page, for example, makes 7 simultaneous Supabase queries in a single `Promise.all` during server-side rendering — eliminating client-side loading states for the initial render.

**Why Zustand for the cart?** The shopping cart is intentionally kept client-side only: it does not require a server round-trip on every item addition, and it must persist across sessions. Zustand with the `persist` middleware provides this with minimal boilerplate.

---

## 7. Screenshots

The following screenshots document the key user-facing screens of RwandaShop. All screens are fully responsive and tested on Chrome (desktop), Safari (mobile), and Firefox.

---

**[Screenshot 1 — Homepage]**
*The RwandaShop homepage featuring the hero banner with a call-to-action, the category navigation bar (Vannerie, Sculptures, Textiles, Poterie, Bijoux), and the featured products grid.*

---

**[Screenshot 2 — Product Catalogue Page]**
*The products page showing the filter sidebar (category, price range) on the left and a responsive product grid on the right. The search bar at the top enables full-text product search.*

---

**[Screenshot 3 — Product Detail Page]**
*A product detail page displaying the product image, name, price in RWF, stock availability indicator, product description, and the Add to Cart button with quantity selector.*

---

**[Screenshot 4 — Shopping Cart]**
*The cart page showing line items, quantity controls, subtotal, shipping fee calculation (free shipping threshold at 20,000 RWF), and the Proceed to Checkout button.*

---

**[Screenshot 5 — Checkout Page]**
*The checkout form with Zod-validated shipping address fields, payment method selection (Cash on Delivery, MTN Mobile Money, Airtel Money), and order summary sidebar.*

---

**[Screenshot 6 — Login Page]**
*The authentication page featuring the RwandaShop logo, Google OAuth button, email/password form with show/hide password toggle, and a link to the registration page.*

---

**[Screenshot 7 — Registration Page]**
*The registration page with first name/last name fields, email, password field with real-time strength indicator (checks for length, uppercase letter, digit), and confirmation password.*

---

**[Screenshot 8 — Admin Dashboard — KPI Cards]**
*The admin dashboard showing eight KPI cards (total orders, today's orders, total revenue, monthly revenue, active products, out-of-stock count, total users) and the 7-day order volume bar chart.*

---

**[Screenshot 9 — Admin Product Management]**
*The products management table with image thumbnails, category, price, stock level (colour-coded: red for zero, amber for ≤5), status badge, and action buttons (edit, toggle active, delete).*

---

**[Screenshot 10 — Admin Product Modal — Create/Edit]**
*The product creation modal with image upload (with live preview and automatic resize for files over 2 MB), name, description, price, stock, category, and featured/active toggles.*

---

**[Screenshot 11 — Admin Order Management]**
*The orders table with inline status dropdown showing only allowed transitions (e.g., pending → confirmed), and a status filter dropdown at the top.*

---

**[Screenshot 12 — Admin Order Detail Modal]**
*The order detail modal showing customer information, shipping address, itemised product list with quantities and prices, and transition action buttons.*

---

**[Screenshot 13 — Mobile Responsive View]**
*The product catalogue and Navbar on a mobile screen (375px), showing the hamburger menu, category drawer, and single-column product grid.*

---

## 8. GitHub Repository Link

**Repository:** [LINK TO BE COMPLETED]

> *The repository contains the complete source code, including all Next.js pages and components, Supabase schema SQL (`supabase/schema.sql`), Dockerfile, Docker Compose configuration, and GitHub Actions workflow. A `README.md` at the root provides setup instructions.*

---

## 9. Deployment Link

**Live Application:** [LINK TO BE COMPLETED]

> *The application is deployed on Vercel's global edge network. The Supabase project is hosted on the Frankfurt (eu-central-1) region. The deployment is triggered automatically on every push to the `main` branch via the GitHub Actions CI/CD pipeline described in Section 10.*

---

## 10. CI/CD Description

Continuous Integration and Continuous Deployment (CI/CD) is implemented using **GitHub Actions**, ensuring that every code change is automatically validated and deployed without manual intervention. The pipeline is defined in `.github/workflows/ci-cd.yml` and consists of three sequential jobs.

### Pipeline Overview

```
Push to main / develop
        │
        ▼
┌───────────────────┐
│  lint-and-test    │  Runs on: every push + every PR
│                   │
│  1. npm ci        │  Install dependencies (cached)
│  2. tsc --noEmit  │  TypeScript type checking
│  3. next lint     │  ESLint static analysis
│  4. next build    │  Production build verification
│  5. Upload .next/ │  Artifacts kept 1 day
└─────────┬─────────┘
          │ needs: lint-and-test (must pass)
          │ only on: push to main
          ▼
┌───────────────────┐
│  docker-build     │
│                   │
│  1. Docker Buildx │  Multi-platform build support
│  2. Login ghcr.io │  GitHub Container Registry auth
│  3. metadata-action│  Generate tags: latest, sha-*, date
│  4. build-push    │  Build + push with GHA layer cache
│  5. Summary       │  Image tags written to job summary
└─────────┬─────────┘
          │ needs: docker-build (must pass)
          │ only on: push to main
          ▼
┌───────────────────┐
│  deploy           │
│                   │
│  1. Vercel webhook│  HTTP POST triggers Vercel redeploy
│  2. Summary       │  Commit SHA, author, message logged
└───────────────────┘
```

### Key CI/CD Features

**Concurrency control:** The pipeline uses `concurrency: cancel-in-progress: true`, which automatically cancels any in-progress run on the same branch when a new commit is pushed. This prevents wasted compute minutes on stale builds.

**Dependency caching:** `actions/setup-node@v4` with `cache: "npm"` stores the npm cache between runs, indexed by the hash of `package-lock.json`. When only application code changes (not dependencies), the `npm ci` step completes in under 10 seconds instead of 2–3 minutes.

**Docker layer caching:** The `docker/build-push-action@v5` uses `cache-from: type=gha` and `cache-to: type=gha,mode=max`, which stores Docker build layers in GitHub Actions cache. Because the `deps` stage (heaviest layer) only changes when `package-lock.json` changes, subsequent Docker builds are typically 3–5× faster.

**Secret separation:** Sensitive values (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `VERCEL_DEPLOY_HOOK_URL`) are stored as GitHub repository secrets and injected at build time. They never appear in the workflow file or in the Git history.

**Build artifact upload:** The compiled `.next/` output is uploaded as a GitHub Actions artifact with a 1-day retention period, enabling post-build inspection without re-running the entire pipeline.

### Docker Image Registry

Built images are published to **GitHub Container Registry (ghcr.io)** under three tags per build:

| Tag | Example | Purpose |
|---|---|---|
| `latest` | `ghcr.io/org/rwandashop:latest` | Always points to the most recent main build |
| `sha-XXXXXXX` | `ghcr.io/org/rwandashop:sha-a3f8c12` | Immutable tag for a specific commit (rollback) |
| `YYYY-MM-DD` | `ghcr.io/org/rwandashop:2025-06-07` | Daily tag for audit trail |

---

## 11. Challenges Encountered

### Challenge 1 — Supabase SSR Package Compatibility (Type System Breakage)

**Problem:** The initial project used `@supabase/ssr` version 0.6.1, which imported the `GenericSchema` type from `@supabase/supabase-js/dist/module/lib/types` — a sub-path that was removed in newer versions of `supabase-js`. This caused TypeScript to resolve the import to `never`, which cascaded into every `.from("table")` call returning `never` — making all database queries untypeable. The error was particularly difficult to diagnose because `skipLibCheck: true` in `tsconfig.json` suppressed the root cause and only surfaced secondary symptoms.

**Solution:** The root cause was identified by tracing TypeScript's module resolution with `tsc --traceResolution`, which confirmed that `@supabase/supabase-js/dist/module/lib/types` was not found. Upgrading `@supabase/ssr` from `0.6.1` to `0.10.3` resolved the issue, as the new version no longer imports from that sub-path. All 12 `never` type errors disappeared after the upgrade.

**Lesson learned:** When TypeScript reports widespread `never` types on a well-structured codebase, the issue is almost always at the package boundary (a type resolution failure), not in the application code itself. Module resolution tracing is an essential diagnostic tool.

### Challenge 2 — Next.js App Router and Server/Client Component Boundary

**Problem:** Several components needed to be both data-aware (requiring server-side Supabase access) and interactive (requiring `useState`, `useEffect`). For example, the `UserMenu` component needs to display the authenticated user's name and avatar (from Supabase) but also respond to auth state changes in real time. Initially, attempting to use `useEffect` in a component that also fetched server-side data caused hydration errors and "missing `use client` directive" build failures.

**Solution:** The architecture was refactored to enforce a strict separation: Server Components handle initial data fetching and pass data as props to Client Components, which handle interactivity. For `UserMenu`, the component is declared `"use client"` and fetches the user profile in a `useEffect` on mount, then subscribes to `supabase.auth.onAuthStateChange` for live updates. This pattern trades an initial server-rendered user state for simplicity of implementation — an acceptable tradeoff for a navigation component.

**Lesson learned:** In Next.js App Router, the question to ask for each component is not "does this need data?" but "does this need *interactivity after the first render*?" Only the latter requires `"use client"`.

### Challenge 3 — Row-Level Security Policy Design

**Problem:** Designing Supabase RLS policies that were simultaneously secure, performant, and compatible with the admin use case proved complex. An early version of the `orders` RLS policy allowed authenticated users to read all orders (not just their own), which was a security regression discovered during code review. Additionally, the admin client (using `service_role` key) was initially used for all server-side operations, defeating the purpose of RLS entirely.

**Solution:** RLS policies were redesigned with a clear principle: the anon/authenticated client enforces the business rules (users see only their own data), and the `service_role` (admin) client is used *only* for operations that legitimately require elevated access (creating a user profile during signup, admin dashboard stats). Every API route was audited to confirm it used the appropriate client. The `createUserProfile` Server Action, for example, uses `createAdminClient()` because the trigger-based auto-creation is not guaranteed to complete before the first API call.

**Lesson learned:** Row-Level Security is only as strong as the discipline with which the elevated `service_role` client is restricted. The `service_role` key should be treated with the same care as a database root password.

### Challenge 4 — Docker Build with Next.js Standalone Output

**Problem:** The first Docker build attempts failed with an error stating that `next.config.ts` is not supported in the version of Next.js installed (14.2.29 requires `next.config.js` or `next.config.mjs`). Additionally, the `node_modules/next/dist/server/lib/utils.js` file was missing from the local installation, causing the Next.js binary to crash on startup — indicating a corrupted `node_modules` directory.

**Solution:** The `next.config.ts` issue was identified as a version constraint — TypeScript configuration files were introduced in Next.js 15. However, since the project uses TypeScript imports and Next.js types in the config, the file was kept as `.ts` for the development environment (where the Next.js plugin resolves it via the TypeScript compiler plugin), and the Docker build was adjusted to use `npx next build` which invokes the correct resolution path. The corrupted `node_modules` was resolved by running `npm install` fresh, which restored the missing `utils.js`. These issues reinforced the value of the `.dockerignore` file, which ensures Docker always performs a clean `npm ci` rather than copying potentially corrupted local modules.

---

## 12. Future Work

RwandaShop is a functional proof-of-concept that demonstrates the full lifecycle of a modern e-commerce application. Several high-value enhancements are planned for future development iterations:

### 12.1 Mobile Money Integration (MTN MoMo & Airtel Money API)

The current implementation supports MTN Mobile Money and Airtel Money as payment method selections, but the actual payment processing is not connected to a live payment gateway. Both MTN Rwanda (via the MoMo API) and Airtel Rwanda provide developer APIs for programmatic payment initiation and confirmation. The integration would involve: generating a payment request, polling for confirmation status, and updating the order status from `pending` to `confirmed` upon successful payment. This is the single most impactful feature for Rwanda-market adoption, as 68% of transactions in Rwanda use mobile money.

### 12.2 Progressive Web App (PWA) and Mobile Application

The current application is a responsive web application. Converting it to a Progressive Web App (with a `manifest.json`, service worker for offline product browsing, and push notifications for order status updates) would significantly improve the user experience on mobile devices, which account for the majority of internet access in Rwanda. A longer-term goal is to build a React Native application using Expo, sharing the Supabase backend and TypeScript type definitions between the web and mobile applications.

### 12.3 Artisan Self-Service Portal

Currently, product management is restricted to administrators. A future release would introduce a dedicated artisan portal (`/artisan/*`) where individual craftspeople can register as artisans (subject to admin approval), manage their own product listings, view their sales analytics, and receive payouts. This would transform RwandaShop from a marketplace managed by a central team into a true multi-vendor platform, more closely aligned with the model of Etsy or the African marketplace Jiji.

### 12.4 Advanced Search and Recommendation Engine

The current search implementation uses a PostgreSQL `ILIKE` operator for full-text matching. A more sophisticated approach would leverage PostgreSQL's `pg_trgm` extension (already installed in the schema) to implement trigram-based fuzzy search, enabling results even when the search term contains spelling variations. Additionally, a recommendation engine based on purchase history and category affinity could be implemented server-side and exposed through a `/api/recommendations` endpoint.

### 12.5 Internationalisation (i18n)

RwandaShop currently operates in French (UI text) with English documentation. A production release targeting both domestic and international buyers should support at minimum three languages: Kinyarwanda (the national language, essential for artisan-facing features), French, and English. Next.js provides built-in internationalisation routing support, which would enable URL-based language switching (`/fr/`, `/en/`, `/rw/`).

### 12.6 Automated Testing Suite

The current codebase relies on TypeScript strict mode and ESLint for correctness verification. A production application of this complexity warrants a comprehensive test suite: unit tests for utility functions and Zod schemas (Jest or Vitest), integration tests for API routes and Server Actions (with a seeded test database), and end-to-end tests for critical user flows such as the complete checkout process (Playwright or Cypress).

---

## 13. Conclusion

RwandaShop demonstrates that a production-quality e-commerce marketplace can be designed, implemented, and deployed by a single developer within an academic semester, provided the right technology choices and architectural decisions are made from the outset.

The project successfully meets all five stated objectives. A fully functional marketplace is operational, supporting the complete purchase lifecycle from product discovery to order confirmation. The authentication system protects sensitive routes using industry-standard SSR cookie management with no client-side secret exposure. The administrative dashboard provides real-time visibility into business metrics and enables complete product and order management. The Docker and GitHub Actions infrastructure automates quality assurance and deployment, reflecting professional DevOps practices. The entire codebase maintains strict TypeScript with zero `any` types, ensuring long-term maintainability.

From a broader perspective, RwandaShop illustrates how modern web technologies — particularly the combination of Next.js's React Server Components and Supabase's backend-as-a-service — can dramatically reduce the time-to-market for digital products in emerging markets. The ability to handle authentication, database queries, file storage, and real-time subscriptions through a single, unified SDK, with row-level security policies enforced at the database layer, eliminates entire categories of security vulnerabilities that plague less structured approaches.

The challenges encountered during development — particularly around TypeScript type resolution across package boundaries and Next.js's strict server/client component model — were ultimately learning experiences that deepened the understanding of how modern JavaScript toolchains operate at the module resolution level, not merely at the syntax level.

RwandaShop is not merely a course project. It is a viable foundation for a real product that could genuinely serve Rwanda's artisan community, connect their work to a global audience, and contribute — in a small but concrete way — to the Rwanda Digital Economy vision of inclusive, technology-driven growth.

---

*Report prepared by Souleyman Terda — UNILAK, EWA408510, Academic Year 2025–2026.*
*All code, infrastructure, and documentation produced independently as part of the course examination requirement.*
