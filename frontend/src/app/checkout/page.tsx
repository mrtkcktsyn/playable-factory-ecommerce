"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { pageContainer, softCard, primaryButton } from "@/styles/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Türkiye");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const TAX_RATE = 0.18; // demo VAT
  const tax = subtotal * TAX_RATE;
  const shipping = items.length > 0 ? 29.9 : 0;
  const total = subtotal + tax + shipping;

  if (!API_URL) {
    return (
      <div className={pageContainer}>
        <p className="text-sm text-red-400">
          NEXT_PUBLIC_API_URL is not defined.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={pageContainer}>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Checkout
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          Your cart is empty. Add some products before checking out.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("playable-token")
          : null;

      if (!token) {
        setError("You must be logged in to place an order (missing token).");
        setLoading(false);
        return;
      }

      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        customerName,
        customerEmail,
        shippingAddress: {
          line1,
          line2,
          city,
          country,
          postalCode,
        },
      };

      const res = await fetch(`${API_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        setError("Not authorized. Please login again.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(
          body.message || `Failed to create order (status ${res.status}).`
        );
        setLoading(false);
        return;
      }

      await res.json();

      setMessage("Order created successfully!");
      clearCart();

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Unknown error during checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={pageContainer}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Checkout
        </h1>
        <p className="text-sm text-slate-400">
          Complete your order. This will call backend{" "}
          <code className="rounded bg-slate-900 px-1 py-0.5 text-[11px]">
            /orders/checkout
          </code>{" "}
          endpoint with your cart items and shipping details.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[3fr,2fr]">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`${softCard} space-y-4 text-sm`}
        >
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Full name
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand.primary"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand.primary"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Address line 1
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand.primary"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Address line 2 (optional)
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand.primary"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                City
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand.primary"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Country
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand.primary"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Postal code
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand.primary"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          {message && (
            <p className="text-xs text-emerald-400">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${primaryButton} mt-2 inline-flex w-full items-center justify-center disabled:opacity-60`}
          >
            {loading ? "Placing order..." : "Place order"}
          </button>
        </form>

        {/* Order summary */}
        <div className={`${softCard} space-y-3 text-sm`}>
          <h2 className="text-sm font-semibold text-slate-100">
            Order summary
          </h2>
          <div className="space-y-2 text-xs text-slate-300">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between"
              >
                <span>
                  {item.name}{" "}
                  <span className="text-slate-500">
                    × {item.quantity}
                  </span>
                </span>
                <span className="font-semibold text-brand.accent">
                  {(item.price * item.quantity).toFixed(2)}₺
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Subtotal</span>
              <span className="font-semibold text-slate-100">
                {subtotal.toFixed(2)}₺
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Tax ({Math.round(TAX_RATE * 100)}% VAT)
              </span>
              <span className="font-semibold text-slate-100">
                {tax.toFixed(2)}₺
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Shipping</span>
              <span className="font-semibold text-slate-100">
                {shipping > 0 ? `${shipping.toFixed(2)}₺` : "Free"}
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-200">
                Total to be charged
              </span>
              <span className="text-base font-semibold text-brand.accent">
                {total.toFixed(2)}₺
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Payment is simulated for the case study. In a production setup
              this is where an external payment provider (Stripe, etc.) would
              be integrated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
