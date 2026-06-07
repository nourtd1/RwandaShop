import type { Metadata } from "next";
import Link from "next/link";
import {
  Leaf, Heart, ShieldCheck, Truck, Users,
  MapPin, Mail, Phone, ArrowRight, Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About — RwandaShop",
  description:
    "Discover RwandaShop's mission: connecting Rwandan artisans with the world. 100% authentic products, fair trade, delivery across all of Rwanda.",
};

// ── Data ──────────────────────────────────────────────────────────

const STATS = [
  { value: "500+",   label: "Partner artisans"        },
  { value: "2 500+", label: "Available products"       },
  { value: "5",      label: "Provinces covered"        },
  { value: "100%",   label: "Guaranteed authenticity"  },
];

const VALUES = [
  {
    icon:  Heart,
    title: "Fair trade",
    desc:  "Every artisan receives a fair wage. We work directly with producers, with no unnecessary middlemen.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon:  ShieldCheck,
    title: "Guaranteed authenticity",
    desc:  "All our products are verified and certified as handcrafted. No industrially produced items are accepted on the platform.",
    color: "bg-green-50 text-green-700",
  },
  {
    icon:  Truck,
    title: "National delivery",
    desc:  "We deliver to all 5 provinces of Rwanda. Free delivery on orders over 20,000 RWF.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon:  Users,
    title: "Local community",
    desc:  "RwandaShop is a 100% Rwandan project, founded in Kigali, committed to developing the local digital economy.",
    color: "bg-amber-50 text-amber-600",
  },
];

const TEAM = [
  { name: "Uwimana Chantal",  role: "Founder & CEO",          initials: "UC" },
  { name: "Nkurunziza Eric",  role: "Crafts Director",        initials: "NE" },
  { name: "Mukamana Diane",   role: "Artisan Relations",      initials: "MD" },
  { name: "Habimana Patrick", role: "Platform Development",   initials: "HP" },
];

const CRAFTS = [
  { emoji: "🧺", name: "Agaseke",  desc: "Palm baskets with geometric patterns symbolising peace and prosperity." },
  { emoji: "🗿", name: "Imigongo", desc: "Wall art made from dried cow dung, featuring spiral patterns in black, white and red." },
  { emoji: "🧵", name: "Kitenge",  desc: "Vibrant wax-print fabrics sewn into clothing, bags or home décor." },
  { emoji: "🏺", name: "Pottery",  desc: "Hand-shaped terracotta ceramics crafted using ancestral techniques." },
  { emoji: "💍", name: "Jewellery", desc: "Ornaments made from wood, seeds, bone and metal, inspired by traditional adornments." },
];

// ── Page ──────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Leaf className="w-3.5 h-3.5" />
            UNILAK Project 2025–2026
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Rwandan crafts,<br />
            <span className="text-amber-400">within reach of the world</span>
          </h1>
          <p className="text-lg text-green-100 max-w-2xl mx-auto leading-relaxed">
            RwandaShop is the first marketplace dedicated to authentic Rwandan crafts.
            Our mission: to connect local artisans with a national and international audience,
            while preserving Rwanda&apos;s cultural heritage.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`px-6 py-10 text-center ${
                  i < STATS.length - 1 ? "sm:border-r border-gray-100" : ""
                }`}
              >
                <dt className="text-3xl font-bold text-green-700 font-serif">{s.value}</dt>
                <dd className="mt-1 text-sm text-gray-500">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Our story ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-3">Our story</p>
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-5 leading-tight">
              Born from a conviction: Rwandan crafts deserve a global stage
            </h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <p>
                RwandaShop was born in 2025 from a simple observation: hundreds of Rwandan
                artisans produce work of exceptional quality, yet their visibility is limited
                to local markets and the occasional passing tourist.
              </p>
              <p>
                Founded as part of the <span className="font-semibold text-gray-800">UNILAK
                E-Commerce 2025</span> programme, this project aims to democratise online commerce
                for artisans — without intermediaries, without technical barriers.
              </p>
              <p>
                Every sale on RwandaShop passes a fair share of the listed price directly to
                the artisans. Our model upholds the principles of <span className="font-semibold text-gray-800">
                fair trade</span> and aligns with the Rwanda Digital Economy 2030 vision.
              </p>
            </div>
          </div>

          {/* Crafts card */}
          <div className="grid grid-cols-2 gap-3">
            {CRAFTS.slice(0, 4).map((c) => (
              <div key={c.name} className="bg-gray-50 rounded-2xl p-4 hover:bg-green-50 transition-colors group">
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{c.emoji}</span>
                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-3">What guides us</p>
            <h2 className="font-serif text-3xl font-bold text-gray-900">Our values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${v.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Rwandan crafts ───────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-3">Cultural heritage</p>
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">
            Five traditions, a thousand skills
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Each category in our catalogue represents a craft tradition passed down from
            generation to generation in Rwanda.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CRAFTS.map((c) => (
            <Link
              key={c.name}
              href={`/products?category=${c.name.toLowerCase()}`}
              className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all group"
            >
              <span className="text-3xl leading-none mt-0.5 group-hover:scale-110 transition-transform">{c.emoji}</span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  {c.name}
                  <ArrowRight className="w-3 h-3 text-green-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-3">The team</p>
            <h2 className="font-serif text-3xl font-bold text-gray-900">The people behind RwandaShop</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {TEAM.map((m) => (
              <div key={m.name} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-700 text-white text-lg font-bold flex items-center justify-center mx-auto mb-3 shadow-sm">
                  {m.initials}
                </div>
                <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ──────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <blockquote className="font-serif text-xl text-gray-800 leading-relaxed mb-6">
          &ldquo;Before RwandaShop, I sold my Agaseke baskets only at the Kimironko market.
          Today, my creations travel as far as Nairobi and Paris.
          It is a complete transformation for my family.&rdquo;
        </blockquote>
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-700 text-white text-sm font-bold flex items-center justify-center">
            MJ
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Mukamurenzi Joséphine</p>
            <p className="text-xs text-gray-500">Basketry artisan — Southern Province</p>
          </div>
        </div>
      </section>

      {/* ── Contact / CTA ────────────────────────────────────────── */}
      <section className="bg-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">Are you an artisan?</h2>
              <p className="text-green-100 text-sm leading-relaxed mb-6">
                Join our seller community and showcase your creations to thousands
                of buyers across Rwanda and beyond.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-green-50 transition-colors"
              >
                Create a seller account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3 text-green-100">
                <Mail className="w-4 h-4 shrink-0 text-green-300" />
                <a href="mailto:contact@rwandashop.rw" className="hover:text-white transition-colors">
                  contact@rwandashop.rw
                </a>
              </li>
              <li className="flex items-center gap-3 text-green-100">
                <Phone className="w-4 h-4 shrink-0 text-green-300" />
                <a href="tel:+250788000000" className="hover:text-white transition-colors">
                  +250 788 000 000
                </a>
              </li>
              <li className="flex items-start gap-3 text-green-100">
                <MapPin className="w-4 h-4 shrink-0 text-green-300 mt-0.5" />
                <address className="not-italic leading-relaxed">
                  KG 11 Ave, Kicukiro<br />
                  Kigali, Rwanda
                </address>
              </li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
}
