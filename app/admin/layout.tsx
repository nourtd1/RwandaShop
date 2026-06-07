"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Leaf,
  ChevronLeft,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

// ── Nav items ─────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard, exact: true  },
  { href: "/admin/products", label: "Products",  icon: Package,         exact: false },
  { href: "/admin/orders",   label: "Orders",    icon: ShoppingBag,     exact: false },
] as const;

// ── Page title map ────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/admin":          "Dashboard",
  "/admin/products": "Product management",
  "/admin/orders":   "Order management",
};

function getPageTitle(pathname: string): string {
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname === key || pathname.startsWith(key + "/")) return val;
  }
  return "Administration";
}

// ── Sidebar content (partagé desktop/mobile) ──────────────────────

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 shrink-0">
        <Link href="/" className="flex items-center gap-2" aria-label="RwandaShop home">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-700 text-white">
            <Leaf className="w-4 h-4" />
          </span>
          <span className="font-serif text-lg font-bold leading-none">
            <span className="text-green-700">Rwanda</span>
            <span className="text-amber-500">Shop</span>
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Badge */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          Admin panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto" aria-label="Navigation admin">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-green-700 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Pied */}
      <div className="p-3 space-y-0.5 border-t border-gray-100 shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          Back to store
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname                    = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar desktop (fixe) */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Overlay mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-200",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
      />

      {/* Drawer mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 lg:hidden",
          "transition-transform duration-300 ease-out shadow-xl"
        )}
        style={{ transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 gap-3 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-900 truncate">
            {getPageTitle(pathname)}
          </h1>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
