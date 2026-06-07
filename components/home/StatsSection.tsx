import { Users, Package, MapPin, Heart } from "lucide-react";

const STATS = [
  { icon: Users,   value: "500+",   label: "Partner artisans",   color: "text-green-700",  bg: "bg-green-50"  },
  { icon: Package, value: "2 500+", label: "Available products", color: "text-blue-700",   bg: "bg-blue-50"   },
  { icon: MapPin,  value: "5",      label: "Provinces covered",  color: "text-purple-700", bg: "bg-purple-50" },
  { icon: Heart,   value: "100%",   label: "Authentic crafts",   color: "text-amber-700",  bg: "bg-amber-50"  },
] as const;

export default function StatsSection() {
  return (
    <section className="bg-white border-b border-gray-100" aria-label="Key figures">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
          {STATS.map(({ icon: Icon, value, label, color, bg }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-8">
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${bg} shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <dt className="sr-only">{label}</dt>
                <dd className="text-2xl font-bold text-gray-900 font-serif leading-none">{value}</dd>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
