"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ShoppingCart, Menu, X, ChevronDown, Leaf,
  Search, Truck, Sparkles, ArrowRight,
} from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/auth/UserMenu";
import type { CategorySlug } from "@/types";

// ── Data ──────────────────────────────────────────────────────────

interface CategoryEntry {
  slug:        CategorySlug;
  label:       string;
  emoji:       string;
  description: string;
}

const CATEGORIES: CategoryEntry[] = [
  { slug: "vannerie",   label: "Basketry",   emoji: "🧺", description: "Agaseke baskets & traditional weaving" },
  { slug: "sculptures", label: "Sculptures", emoji: "🗿", description: "Imigongo art & wood sculptures" },
  { slug: "textiles",   label: "Textiles",   emoji: "🧵", description: "Kitenge fabrics & colourful wraps" },
  { slug: "poterie",    label: "Pottery",    emoji: "🏺", description: "Ceramics & terracotta objects" },
  { slug: "bijoux",     label: "Jewellery",  emoji: "💍", description: "Hand-crafted jewellery & ornaments" },
];

const NAV_LINKS = [
  { href: "/",         label: "Home"     },
  { href: "/products", label: "Products" },
  { href: "/about",    label: "About"    },
];

// ── Helpers ───────────────────────────────────────────────────────

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

// ── Announcement bar ──────────────────────────────────────────────

function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="relative bg-rwanda-green-700 text-white text-xs font-medium">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-6">
        <span className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 shrink-0" />
          Free delivery from 20&nbsp;000 RWF
        </span>
        <span className="hidden sm:flex items-center gap-1.5 opacity-80">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          100&nbsp;% authentic Rwandan crafts
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Categories mega-dropdown ──────────────────────────────────────

function CategoriesDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);
  const timeoutRef      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCategoryActive = CATEGORIES.some(
    (c) => pathname.startsWith(`/products`) && pathname.includes(c.slug)
  );

  const openMenu  = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setOpen(true); };
  const closeMenu = () => { timeoutRef.current = setTimeout(() => setOpen(false), 120); };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1 px-1 py-1 text-sm font-medium transition-colors duration-150",
          isCategoryActive
            ? "text-rwanda-green-700"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        Categories
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {/* Mega-dropdown */}
      <div
        className={cn(
          "absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[480px] z-50",
          "transition-all duration-200 origin-top",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}
        onMouseEnter={openMenu}
        onMouseLeave={closeMenu}
      >
        {/* Arrow */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />

        <div className="bg-white rounded-2xl shadow-[0_8px_32px_-4px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Our categories</p>
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1 text-xs font-medium text-rwanda-green-700 hover:gap-2 transition-all"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 2-column grid */}
          <div className="grid grid-cols-2 gap-px bg-gray-100 p-px">
            {CATEGORIES.map((cat) => {
              const active = pathname.includes(cat.slug);
              return (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-start gap-3.5 px-4 py-3.5 bg-white transition-colors group",
                    active ? "bg-rwanda-green-50" : "hover:bg-gray-50"
                  )}
                >
                  <span className="text-2xl leading-none mt-0.5 group-hover:scale-110 transition-transform">
                    {cat.emoji}
                  </span>
                  <div>
                    <p className={cn(
                      "text-sm font-semibold leading-none mb-1",
                      active ? "text-rwanda-green-700" : "text-gray-800"
                    )}>
                      {cat.label}
                    </p>
                    <p className="text-xs text-gray-400 leading-snug">{cat.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Expandable search ─────────────────────────────────────────────

function SearchBar() {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState("");
  const inputRef            = useRef<HTMLInputElement>(null);
  const pathname            = usePathname();

  const close = useCallback(() => { setOpen(false); setQuery(""); }, []);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { close(); }, [pathname, close]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  return (
    <div className="relative">
      {/* Icon button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "p-2 rounded-lg transition-colors duration-150",
          open ? "text-rwanda-green-700 bg-rwanda-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        )}
        aria-label="Search"
      >
        <Search className="w-4.5 h-4.5" />
      </button>

      {/* Search panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="absolute right-0 top-full mt-2 w-72 z-50 animate-scale-in">
            <div className="bg-white rounded-xl shadow-[0_8px_32px_-4px_rgb(0,0,0,0.14)] border border-gray-100 overflow-hidden">
              <form
                action="/products"
                className="flex items-center gap-2 px-3 py-2.5"
              >
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  name="search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a product…"
                  className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="text-gray-300 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
              <div className="px-4 pb-3">
                <p className="text-[10px] font-medium text-gray-400 mb-1.5">Suggestions</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/products?category=${c.slug}`}
                      onClick={close}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-xs text-gray-600 hover:bg-rwanda-green-50 hover:text-rwanda-green-700 transition-colors"
                    >
                      <span>{c.emoji}</span> {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Cart badge ────────────────────────────────────────────────────

function CartButton({ count }: { count: number }) {
  const pathname = usePathname();
  return (
    <Link
      href="/cart"
      className={cn(
        "relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
        isActive(pathname, "/cart")
          ? "text-rwanda-green-700 bg-rwanda-green-50"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      )}
      aria-label={`Cart${count > 0 ? ` — ${count} item${count > 1 ? "s" : ""}` : ""}`}
    >
      <span className="relative">
        <ShoppingCart className="w-5 h-5" />
        {count > 0 && (
          <span className={cn(
            "absolute -top-2 -right-2",
            "min-w-[18px] h-[18px] px-1",
            "bg-rwanda-green-600 text-white text-[10px] font-bold leading-none",
            "rounded-full flex items-center justify-center",
            "ring-2 ring-white"
          )}>
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      {count > 0 && (
        <span className="hidden lg:inline text-xs font-semibold tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function Navbar() {
  const pathname              = usePathname();
  const { itemCount }         = useCart();
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const [expandedMobile, setExpandedMobile] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* Announcement bar */}
      <AnnouncementBar />

      {/* ── Main navbar ──────────────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full",
          "bg-white/95 backdrop-blur-md",
          "transition-all duration-300",
          scrolled
            ? "border-b border-gray-200 shadow-[0_1px_12px_-2px_rgb(0,0,0,0.08)]"
            : "border-b border-gray-100"
        )}
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between h-[60px] gap-4">

            {/* ── Logo ─────────────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0 group"
              aria-label="RwandaShop — Home"
            >
              <span className={cn(
                "flex items-center justify-center w-8 h-8 rounded-xl text-white shadow-sm transition-all duration-200",
                "bg-rwanda-green-700 group-hover:bg-rwanda-green-600 group-hover:shadow-md group-hover:scale-105"
              )}>
                <Leaf className="w-4 h-4" />
              </span>
              <span className="font-serif text-[22px] font-bold leading-none tracking-tight">
                <span className="text-rwanda-green-700">Rwanda</span>
                <span className="text-rwanda-gold-500">Shop</span>
              </span>
            </Link>

            {/* ── Desktop links ─────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                      active
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {link.label}
                    {/* Active underline */}
                    <span className={cn(
                      "absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-rwanda-green-600 transition-all duration-200",
                      active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                    )} />
                  </Link>
                );
              })}

              {/* Separator */}
              <span className="w-px h-4 bg-gray-200 mx-1" />

              <CategoriesDropdown pathname={pathname} />
            </div>

            {/* ── Actions ──────────────────────────────────────── */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Search */}
              <div className="hidden sm:block">
                <SearchBar />
              </div>

              {/* Divider */}
              <span className="hidden sm:block w-px h-4 bg-gray-200 mx-0.5" />

              {/* Cart */}
              <CartButton count={itemCount} />

              {/* Account */}
              <div className="hidden sm:block">
                <UserMenu />
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden ml-1 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
                aria-expanded={drawerOpen}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer ────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />

        {/* Panel */}
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-[300px] bg-white flex flex-col shadow-2xl",
            "transition-transform duration-300 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          )}
          aria-label="Mobile menu"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-[60px] border-b border-gray-100 shrink-0">
            <Link href="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-rwanda-green-700 text-white">
                <Leaf className="w-3.5 h-3.5" />
              </span>
              <span className="font-serif text-lg font-bold">
                <span className="text-rwanda-green-700">Rwanda</span>
                <span className="text-rwanda-gold-500">Shop</span>
              </span>
            </Link>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Mobile search */}
          <div className="px-4 py-3 border-b border-gray-50 shrink-0">
            <form action="/products" className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                name="search"
                type="search"
                placeholder="Search…"
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400"
              />
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-3">
            {/* Main links */}
            <div className="space-y-0.5 mb-4">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      active
                        ? "text-rwanda-green-700 bg-rwanda-green-50"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {link.label}
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rwanda-green-600" />}
                  </Link>
                );
              })}
            </div>

            {/* Categories accordion */}
            <div className="border-t border-gray-100 pt-3">
              <button
                onClick={() => setExpandedMobile((v) => !v)}
                aria-expanded={expandedMobile}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>Categories</span>
                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", expandedMobile && "rotate-180")} />
              </button>

              {expandedMobile && (
                <div className="mt-1 space-y-0.5 animate-fade-in">
                  {CATEGORIES.map((cat) => {
                    const active = pathname.includes(cat.slug);
                    return (
                      <Link
                        key={cat.slug}
                        href={`/products?category=${cat.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ml-2",
                          active
                            ? "text-rwanda-green-700 bg-rwanda-green-50 font-medium"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-lg leading-none">{cat.emoji}</span>
                        <div>
                          <p className="font-medium leading-none">{cat.label}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{cat.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Drawer footer */}
          <div className="border-t border-gray-100 px-4 py-4 space-y-2 shrink-0">
            <Link
              href="/cart"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4" />
                My cart
              </span>
              {itemCount > 0 && (
                <span className="bg-rwanda-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            <div className="px-3 py-1">
              <UserMenu />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
