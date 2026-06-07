import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  CalendarDays,
  BarChart3,
  Banknote,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────

interface StatCard {
  label:    string;
  value:    string;
  sub?:     string;
  icon:     React.ElementType;
  color:    string;
  iconBg:   string;
}

interface DayData {
  date:  string; // "YYYY-MM-DD"
  label: string; // "Mon", "Tue" …
  count: number;
}

// ── Data fetching ─────────────────────────────────────────────────

async function getStats() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    { count: totalOrders },
    { count: todayOrders },
    { data: revenue },
    { data: monthRevenue },
    { count: activeProducts },
    { count: outOfStock },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("orders")
      .select("grand_total")
      .in("status", ["confirmed", "shipped", "delivered"]),
    supabase
      .from("orders")
      .select("grand_total")
      .in("status", ["confirmed", "shipped", "delivered"])
      .gte("created_at", monthStart.toISOString()),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("stock", 0)
      .eq("is_active", true),
    supabase.from("users").select("*", { count: "exact", head: true }),
  ]);

  const totalRevenue = (revenue ?? []).reduce((s, o) => s + o.grand_total, 0);
  const mRevenue     = (monthRevenue ?? []).reduce((s, o) => s + o.grand_total, 0);

  return {
    totalOrders:    totalOrders ?? 0,
    todayOrders:    todayOrders ?? 0,
    totalRevenue,
    monthRevenue:   mRevenue,
    activeProducts: activeProducts ?? 0,
    outOfStock:     outOfStock ?? 0,
    totalUsers:     totalUsers ?? 0,
  };
}

async function getOrdersLast7Days(): Promise<DayData[]> {
  const supabase = await createClient();

  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("orders")
    .select("created_at")
    .gte("created_at", start.toISOString())
    .order("created_at", { ascending: true });

  // Build a map date → count for the last 7 days
  const days: DayData[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      date:  d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      count: 0,
    };
  });

  for (const row of data ?? []) {
    const key = row.created_at.slice(0, 10);
    const slot = days.find((d) => d.date === key);
    if (slot) slot.count++;
  }

  return days;
}

// ── SVG bar chart ─────────────────────────────────────────────────

function BarChart({ data }: { data: DayData[] }) {
  const max    = Math.max(...data.map((d) => d.count), 1);
  const H      = 120;
  const W      = 100 / data.length; // % per column
  const BAR_W  = 55;                 // % of column for bar

  return (
    <div className="mt-4">
      <div className="flex items-end gap-1.5 h-32" aria-label="Orders over the last 7 days" role="img">
        {data.map((day) => {
          const pct   = max > 0 ? (day.count / max) * H : 0;
          const isMax = day.count === max && max > 0;
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1 group"
              title={`${day.label}: ${day.count} order${day.count !== 1 ? "s" : ""}`}
            >
              {/* Count above */}
              <span className="text-[10px] font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {day.count}
              </span>
              {/* Bar */}
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${
                  isMax ? "bg-green-600" : "bg-green-200 group-hover:bg-green-400"
                }`}
                style={{ height: `${Math.max(pct, day.count > 0 ? 4 : 2)}px` }}
              />
              {/* Day label */}
              <span className="text-[10px] text-gray-400 capitalize">{day.label.slice(0, 3)}</span>
            </div>
          );
        })}
      </div>
      {/* Zero baseline */}
      <div className="h-px bg-gray-200 -mt-1" />
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────────

function StatCard({ card }: { card: StatCard }) {
  const Icon = card.icon;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`flex-none flex items-center justify-center w-11 h-11 rounded-xl ${card.iconBg}`}>
        <Icon className={`w-5 h-5 ${card.color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{card.label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 tabular-nums">{card.value}</p>
        {card.sub && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{card.sub}</p>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const [stats, chartData] = await Promise.all([
    getStats(),
    getOrdersLast7Days(),
  ]);

  const cards: StatCard[] = [
    {
      label:  "Total orders",
      value:  stats.totalOrders.toLocaleString("en-US"),
      sub:    `+${stats.todayOrders} today`,
      icon:   ShoppingBag,
      color:  "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label:  "Total confirmed revenue",
      value:  formatPrice(stats.totalRevenue),
      sub:    `${formatPrice(stats.monthRevenue)} this month`,
      icon:   Banknote,
      color:  "text-green-700",
      iconBg: "bg-green-50",
    },
    {
      label:  "Active products",
      value:  stats.activeProducts.toLocaleString("en-US"),
      sub:    stats.outOfStock > 0
        ? `${stats.outOfStock} out of stock`
        : "No stock issues",
      icon:   Package,
      color:  "text-amber-600",
      iconBg: "bg-amber-50",
    },
    {
      label:  "Registered customers",
      value:  stats.totalUsers.toLocaleString("en-US"),
      icon:   Users,
      color:  "text-purple-600",
      iconBg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Overview of the RwandaShop marketplace</p>
      </div>

      {/* Out-of-stock alert */}
      {stats.outOfStock > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">{stats.outOfStock} product{stats.outOfStock > 1 ? "s" : ""}</span>
            {" "}out of stock — consider restocking.
          </span>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCard key={card.label} card={card} />
        ))}
      </div>

      {/* Bottom row: chart + quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* 7-day chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-700" />
              <h3 className="text-sm font-semibold text-gray-900">Orders — last 7 days</h3>
            </div>
            <span className="text-xs text-gray-400">
              Total: {chartData.reduce((s, d) => s + d.count, 0)}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-2">All order statuses combined</p>
          <BarChart data={chartData} />
        </div>

        {/* Quick stats (1/3 width) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-700" />
            <h3 className="text-sm font-semibold text-gray-900">Today</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                New orders
              </div>
              <span className="text-sm font-bold text-gray-900 tabular-nums">{stats.todayOrders}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Banknote className="w-4 h-4 text-gray-400" />
                Revenue this month
              </div>
              <span className="text-sm font-bold text-gray-900 tabular-nums">{formatPrice(stats.monthRevenue)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="w-4 h-4 text-gray-400" />
                Active products
              </div>
              <span className="text-sm font-bold text-gray-900 tabular-nums">{stats.activeProducts}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Out of stock
              </div>
              <span className={`text-sm font-bold tabular-nums ${stats.outOfStock > 0 ? "text-amber-600" : "text-gray-900"}`}>
                {stats.outOfStock}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
