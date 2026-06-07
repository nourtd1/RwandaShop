import Link from "next/link";
import { ArrowRight, Truck, CreditCard, Clock } from "lucide-react";

const PERKS = [
  { icon: Truck,       label: "Free delivery",          sub: "On orders over 20,000 RWF"   },
  { icon: CreditCard,  label: "MTN MoMo & Airtel",      sub: "Secure mobile payment"       },
  { icon: Clock,       label: "2–5 day delivery",       sub: "Across Rwanda"               },
] as const;

export default function PromoBanner() {
  return (
    <section className="bg-green-700" aria-label="RwandaShop benefits">

      {/* Perks band */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x divide-green-600">
          {PERKS.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-4 sm:px-8 first:sm:pl-0 last:sm:pr-0">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/15 border border-white/20 shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-xs text-green-200 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA banner */}
      <div className="relative overflow-hidden border-t border-green-600">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-green-300 mb-1">Current offer</p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Discover our new arrivals
              </h2>
              <p className="text-green-200 text-sm mt-1.5">
                Over 2,500 hand-crafted products, delivered directly from the artisan to you.
              </p>
            </div>
            <Link
              href="/products"
              className="shrink-0 inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-green-950 font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-black/20 transition-all duration-200 hover:scale-[1.03] active:scale-100 whitespace-nowrap"
            >
              View the collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
