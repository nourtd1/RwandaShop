"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useCart } from "@/lib/hooks/useCart";

export default function CheckoutPage() {
  const { items } = useCart();
  const router    = useRouter();

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items.length, router]);

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900">
          Checkout
        </h1>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-rwanda-green-600" aria-hidden="true" />
          Secure checkout — no charges until delivery
        </div>
      </div>

      <ol className="flex items-center gap-0 mb-10 max-w-sm" aria-label="Order steps">
        {[
          { step: 1, label: "Cart",     done: true  },
          { step: 2, label: "Shipping", done: false },
          { step: 3, label: "Confirm",  done: false },
        ].map(({ step, label, done }, i, arr) => (
          <li key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${done
                    ? "bg-rwanda-green-600 text-white"
                    : step === 2
                    ? "bg-rwanda-green-100 text-rwanda-green-700 ring-2 ring-rwanda-green-500"
                    : "bg-gray-100 text-gray-400"}
                `}
                aria-current={step === 2 ? "step" : undefined}
              >
                {done ? "✓" : step}
              </span>
              <span className={`text-xs font-medium hidden sm:inline ${
                step === 2 ? "text-rwanda-green-700" : done ? "text-gray-500" : "text-gray-400"
              }`}>
                {label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div className="w-8 h-px bg-gray-200 mx-2" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <CheckoutForm />
        </div>
        <div className="lg:col-span-2">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
