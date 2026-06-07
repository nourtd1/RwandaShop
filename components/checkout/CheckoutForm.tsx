"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Banknote, Phone, AlertCircle, ChevronRight } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { cn } from "@/lib/utils";
import { SHIPPING_FEE, SHIPPING_THRESHOLD } from "@/components/cart/CartSummary";

const RWANDA_PHONE = /^\+?2507[2389]\d{7}$/;
const RWANDA_CITIES = ["Kigali", "Gisenyi", "Huye", "Musanze", "Butare"] as const;

const checkoutSchema = z.object({
  full_name:      z.string().min(2, "Full name required (min 2 characters)"),
  email:          z.string().email("Invalid email address"),
  phone:          z.string().regex(RWANDA_PHONE, "Invalid format — e.g. +250 78X XXX XXX"),
  address_line1:  z.string().min(4, "Address required (min 4 characters)"),
  city:           z.enum(RWANDA_CITIES, { errorMap: () => ({ message: "City required" }) }),
  notes:          z.string().max(300, "Maximum 300 characters").optional(),
  payment_method: z.enum(["cash_on_delivery"] as const),
});

type CheckoutFields = z.infer<typeof checkoutSchema>;
type FieldErrors = Partial<Record<keyof CheckoutFields, string>>;

const INITIAL: CheckoutFields = {
  full_name:      "",
  email:          "",
  phone:          "+250 ",
  address_line1:  "",
  city:           "Kigali",
  notes:          "",
  payment_method: "cash_on_delivery",
};

interface FieldProps {
  label:     string;
  id:        string;
  error?:    string;
  required?: boolean;
  children:  React.ReactNode;
}

function Field({ label, id, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutForm() {
  const router   = useRouter();
  const { items, total, clearCart } = useCart();
  const [form, setForm]       = useState<CheckoutFields>(INITIAL);
  const [errors, setErrors]   = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const shipping   = total >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = total + shipping;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CheckoutFields]) {
      setErrors((prev) => { const next = { ...prev }; delete next[name as keyof CheckoutFields]; return next; });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof CheckoutFields;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      const firstKey = Object.keys(fieldErrors)[0];
      if (firstKey) document.getElementById(firstKey)?.focus();
      return;
    }

    if (items.length === 0) return;
    setSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        quantity:   item.quantity,
        price:      item.product.price,
        line_total: item.product.price * item.quantity,
      }));

      const res = await fetch("/api/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items:            orderItems,
          shipping_address: {
            full_name:     result.data.full_name,
            phone:         result.data.phone,
            address_line1: result.data.address_line1,
            address_line2: null,
            city:          result.data.city,
            province:      result.data.city === "Kigali" ? "Kigali" : "North",
            country:       "Rwanda",
          },
          payment_method: result.data.payment_method,
          notes:          result.data.notes ?? null,
          total:          total,
          shipping_fee:   shipping,
          grand_total:    grandTotal,
        }),
      });

      if (!res.ok) {
        const body = await res.json() as { message?: string };
        throw new Error(body.message ?? "Failed to create order");
      }

      const order = await res.json() as { id: string };
      clearCart();
      router.push(`/order-confirmation?id=${order.id}`);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">

      {serverError && (
        <div role="alert" className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p>{serverError}</p>
        </div>
      )}

      {/* Section 1: Customer information */}
      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-gray-900 pb-1 border-b border-gray-100 w-full">
          1. Customer information
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name" id="full_name" error={errors.full_name} required>
            <input
              id="full_name" name="full_name" type="text"
              value={form.full_name} onChange={handleChange}
              placeholder="Jean de Dieu Uwimana"
              autoComplete="name"
              aria-describedby={errors.full_name ? "full_name-error" : undefined}
              className={cn("input", errors.full_name && "border-red-400 focus:ring-red-400")}
            />
          </Field>

          <Field label="Email address" id="email" error={errors.email} required>
            <input
              id="email" name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder="you@example.rw"
              autoComplete="email"
              aria-describedby={errors.email ? "email-error" : undefined}
              className={cn("input", errors.email && "border-red-400 focus:ring-red-400")}
            />
          </Field>

          <Field label="Phone number" id="phone" error={errors.phone} required>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
              <input
                id="phone" name="phone" type="tel"
                value={form.phone} onChange={handleChange}
                placeholder="+250 78X XXX XXX"
                autoComplete="tel"
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className={cn("input pl-9", errors.phone && "border-red-400 focus:ring-red-400")}
              />
            </div>
          </Field>
        </div>
      </fieldset>

      {/* Section 2: Delivery address */}
      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-gray-900 pb-1 border-b border-gray-100 w-full">
          2. Delivery address
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Street / Sector / Address" id="address_line1" error={errors.address_line1} required>
            <input
              id="address_line1" name="address_line1" type="text"
              value={form.address_line1} onChange={handleChange}
              placeholder="KG 23 Ave, Gasabo"
              autoComplete="street-address"
              aria-describedby={errors.address_line1 ? "address_line1-error" : undefined}
              className={cn("input", errors.address_line1 && "border-red-400 focus:ring-red-400")}
            />
          </Field>

          <Field label="City" id="city" error={errors.city} required>
            <select
              id="city" name="city"
              value={form.city} onChange={handleChange}
              aria-describedby={errors.city ? "city-error" : undefined}
              className={cn("input", errors.city && "border-red-400 focus:ring-red-400")}
            >
              {RWANDA_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Delivery instructions" id="notes" error={errors.notes}>
              <textarea
                id="notes" name="notes"
                value={form.notes} onChange={handleChange}
                rows={3}
                placeholder="Additional instructions for the delivery driver (optional)…"
                aria-describedby={errors.notes ? "notes-error" : undefined}
                className={cn("input resize-none", errors.notes && "border-red-400 focus:ring-red-400")}
              />
            </Field>
          </div>
        </div>
      </fieldset>

      {/* Section 3: Payment method */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-gray-900 pb-1 border-b border-gray-100 w-full">
          3. Payment method
        </legend>

        <div className="space-y-3">
          <label className={cn(
            "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
            form.payment_method === "cash_on_delivery"
              ? "border-rwanda-green-500 bg-rwanda-green-50"
              : "border-gray-200 hover:border-gray-300"
          )}>
            <input
              type="radio" name="payment_method" value="cash_on_delivery"
              checked={form.payment_method === "cash_on_delivery"}
              onChange={handleChange}
              className="w-4 h-4 text-rwanda-green-600 focus:ring-rwanda-green-500 border-gray-300"
            />
            <Banknote className="w-5 h-5 text-rwanda-green-600 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-gray-900">Cash on delivery</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Cash or Mobile Money (MTN / Airtel) upon delivery
              </p>
            </div>
          </label>

          <div
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed select-none"
            aria-disabled="true"
          >
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-yellow-900">MTN</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">MTN Mobile Money</p>
              <p className="text-xs text-gray-400 mt-0.5">Pay directly from your MoMo account</p>
            </div>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full whitespace-nowrap">
              Coming soon
            </span>
          </div>
        </div>
      </fieldset>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || items.length === 0}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl",
          "text-base font-semibold transition-all duration-150",
          submitting || items.length === 0
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "btn-primary hover:scale-[1.01] active:scale-100 shadow-sm shadow-rwanda-green-700/20"
        )}
        aria-busy={submitting}
      >
        {submitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
            Processing…
          </>
        ) : (
          <>
            Place order
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-xs text-center text-gray-400">
        By placing your order you agree to our terms and conditions.
        <br />
        No payment is charged until delivery.
      </p>
    </form>
  );
}
