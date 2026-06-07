import Link from "next/link";
import { Award, ShieldCheck, PackageCheck, HeartHandshake, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon:   LucideIcon;
  title:  string;
  desc:   string;
  bg:     string;
  color:  string;
  number: string;
}

const FEATURES: Feature[] = [
  {
    icon:   Award,
    title:  "100% authentic craftsmanship",
    desc:   "Every product is hand-crafted by certified Rwandan artisans using ancestral techniques passed down through generations. No industrial items are accepted on the platform.",
    bg:     "bg-green-50",
    color:  "text-green-700",
    number: "01",
  },
  {
    icon:   ShieldCheck,
    title:  "Secure payment",
    desc:   "Pay with MTN Mobile Money, Airtel Money or cash on delivery. All transactions are encrypted and secure.",
    bg:     "bg-blue-50",
    color:  "text-blue-700",
    number: "02",
  },
  {
    icon:   PackageCheck,
    title:  "Fast delivery",
    desc:   "Delivery in 2 to 5 days across Rwanda. Free delivery in Kigali on orders over 20,000 RWF.",
    bg:     "bg-amber-50",
    color:  "text-amber-700",
    number: "03",
  },
  {
    icon:   HeartHandshake,
    title:  "Fair trade",
    desc:   "Every purchase directly passes a fair share to the artisan. No unnecessary middlemen.",
    bg:     "bg-rose-50",
    color:  "text-rose-700",
    number: "04",
  },
];

const TESTIMONIALS = [
  {
    quote: "I ordered an Agaseke basket for my mother — it arrived perfectly packaged in 3 days. Exceptional quality.",
    name:  "Diane M.",
    role:  "Customer — Kigali",
    init:  "DM",
    bg:    "bg-green-700",
  },
  {
    quote: "RwandaShop allowed me to sell my sculptures far beyond Kigali. It's a true revolution for artisans.",
    name:  "Emmanuel K.",
    role:  "Sculptor artisan — Musanze",
    init:  "EK",
    bg:    "bg-amber-600",
  },
  {
    quote: "MTN MoMo payment is so convenient. I order from my phone without a bank card.",
    name:  "Solange U.",
    role:  "Customer — Huye",
    init:  "SU",
    bg:    "bg-blue-700",
  },
] as const;

export default function WhyUsSection() {
  return (
    <>
      {/* ── Why us section ────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24" aria-labelledby="why-us-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-3">Our commitments</p>
            <h2 id="why-us-heading" className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Why choose{" "}
              <span className="text-green-700">RwandaShop</span>?
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              A marketplace carefully designed to showcase Rwandan crafts
              and offer a simple, secure and ethical shopping experience.
            </p>
          </div>

          {/* 2×2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, bg, color, number }) => (
              <div
                key={title}
                className="group relative flex flex-col gap-5 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Decorative number */}
                <span className="absolute top-4 right-5 text-4xl font-bold text-gray-50 select-none group-hover:text-gray-100 transition-colors">
                  {number}
                </span>

                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${bg} ${color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 sm:py-24" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-3">Testimonials</p>
            <h2 id="testimonials-heading" className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              What our customers say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-5 bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-sm text-gray-700 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.bg} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                    {t.init}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-green-900 to-green-800 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-4">Ready to start?</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
            Explore hundreds of unique<br />
            <span className="text-amber-400">and authentic creations</span>
          </h2>
          <p className="text-green-200 text-sm mb-9 max-w-lg mx-auto leading-relaxed">
            Every purchase directly supports a Rwandan artisan and preserves
            an invaluable cultural heritage.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-green-950 font-bold text-sm px-8 py-4 rounded-xl shadow-lg shadow-amber-400/20 transition-all duration-200 hover:scale-[1.03]"
            >
              Discover products
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-8 py-4 rounded-xl border border-white/15 backdrop-blur-sm transition-all duration-200"
            >
              Create a free account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
