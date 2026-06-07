import Link from "next/link";
import { MapPin, Mail, Phone, Instagram, Facebook, Twitter, Leaf } from "lucide-react";
import type { CategorySlug } from "@/types";

// ── Types ─────────────────────────────────────────────────────────

interface FooterLink {
  href:  string;
  label: string;
}

interface CategoryEntry {
  slug:  CategorySlug;
  label: string;
  emoji: string;
}

// ── Data ──────────────────────────────────────────────────────────

const CATEGORIES: CategoryEntry[] = [
  { slug: "vannerie",   label: "Basketry",   emoji: "🧺" },
  { slug: "sculptures", label: "Sculptures", emoji: "🗿" },
  { slug: "textiles",   label: "Textiles",   emoji: "🧵" },
  { slug: "poterie",    label: "Pottery",    emoji: "🏺" },
  { slug: "bijoux",     label: "Jewellery",  emoji: "💍" },
];

const NAV_LINKS: FooterLink[] = [
  { href: "/",              label: "Home"       },
  { href: "/products",      label: "Products"   },
  { href: "/about",         label: "About"      },
  { href: "/shipping",      label: "Shipping"   },
  { href: "/account",       label: "My account" },
];

const SOCIAL_LINKS = [
  { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
  { href: "https://facebook.com",  label: "Facebook",  Icon: Facebook  },
  { href: "https://twitter.com",   label: "Twitter",   Icon: Twitter   },
] as const;

// ── Component ─────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* ── Rwandan decorative band ──────────────────────────────── */}
      <div className="h-1 w-full bg-gradient-rwanda" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">

          {/* ── Column 1: About ──────────────────────────────────── */}
          <div className="space-y-4">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2 group" aria-label="RwandaShop">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-rwanda-green-700 text-white">
                <Leaf className="w-4 h-4" />
              </span>
              <span className="font-serif text-xl font-bold">
                <span className="text-white">Rwanda</span>
                <span className="text-rwanda-gold-400">Shop</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-xs">
              The first marketplace dedicated to authentic Rwandan crafts.
              Every purchase directly supports local artisans across Kigali and the provinces.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 text-gray-400 hover:bg-rwanda-green-700 hover:text-white transition-colors duration-150"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Column 2: Navigation & Categories ────────────────── */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-4">
                Navigation
              </h3>
              <ul className="space-y-2.5 text-sm">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-4">
                Categories
              </h3>
              <ul className="space-y-2.5 text-sm">
                {CATEGORIES.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="flex items-center gap-2 hover:text-white transition-colors duration-150"
                    >
                      <span className="text-sm leading-none">{cat.emoji}</span>
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Column 3: Contact ─────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-4">
              Contact
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <a
                  href="mailto:contact@rwandashop.rw"
                  className="flex items-start gap-3 hover:text-white transition-colors duration-150 group"
                >
                  <Mail className="w-4 h-4 mt-0.5 shrink-0 text-rwanda-green-500 group-hover:text-rwanda-green-400" />
                  contact@rwandashop.rw
                </a>
              </li>
              <li>
                <a
                  href="tel:+250788000000"
                  className="flex items-start gap-3 hover:text-white transition-colors duration-150 group"
                >
                  <Phone className="w-4 h-4 mt-0.5 shrink-0 text-rwanda-green-500 group-hover:text-rwanda-green-400" />
                  +250 788 000 000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-rwanda-green-500" />
                <address className="not-italic leading-relaxed">
                  KG 11 Ave, Kicukiro<br />
                  Kigali, Rwanda
                </address>
              </li>
            </ul>

            {/* UNILAK badge */}
            <div className="mt-6 inline-flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-rwanda-green-500 animate-pulse" aria-hidden="true" />
              <span className="text-xs text-gray-400">UNILAK Project 2026</span>
            </div>
          </div>
        </div>

        {/* ── Footer bottom: copyright ──────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            &copy; 2026 <span className="text-gray-400 font-medium">RwandaShop</span>.
            All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Made with
            <span className="text-rwanda-red-500 mx-0.5" aria-label="love">♥</span>
            in Rwanda
          </p>
        </div>
      </div>
    </footer>
  );
}
