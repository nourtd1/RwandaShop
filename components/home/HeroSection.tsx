import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

const TRUST_SIGNALS = [
  "500+ local artisans",
  "Delivery across Rwanda",
  "MTN MoMo & Airtel payments",
] as const;

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-rwanda-green-900 via-rwanda-green-800 to-rwanda-green-700"
      aria-label="Welcome to RwandaShop"
    >
      {/* Kente pattern overlay */}
      <div className="absolute inset-0 bg-pattern-kente opacity-[0.07] pointer-events-none" aria-hidden="true" />

      {/* Ambient glow blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-rwanda-sky-700/20 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-rwanda-gold-500/10 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-36">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">

          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-rwanda-gold-300 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-rwanda-gold-400 animate-pulse" aria-hidden="true" />
            Authentic Rwandan crafts
          </span>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight animate-slide-up">
            Rwandan crafts,
            <br />
            <span className="text-rwanda-gold-400"><em>reinvented</em> for the world</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-rwanda-green-100 max-w-xl leading-relaxed animate-slide-up">
            Discover unique creations by local artisans — Agaseke bas&shy;ketry, Imigongo sculptures, Kitenge textiles and much more.
            <br className="hidden sm:block" />
            Every purchase directly supports a family.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-slide-up">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-rwanda-gold-500 hover:bg-rwanda-gold-400 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-rwanda-gold-500/30 transition-all duration-150 hover:scale-105 active:scale-100"
            >
              Explore products
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all duration-150 backdrop-blur-sm"
            >
              Our story
            </Link>
          </div>

          {/* Trust signals */}
          <ul className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-fade-in">
            {TRUST_SIGNALS.map((signal) => (
              <li key={signal} className="flex items-center gap-2 text-sm text-rwanda-green-200">
                <CheckCircle className="w-4 h-4 text-rwanda-green-400 shrink-0" />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" aria-hidden="true" />
    </section>
  );
}
