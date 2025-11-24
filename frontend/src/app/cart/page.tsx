"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { pageContainer, softCard, primaryButton } from "@/styles/ui";

export default function CartPage() {
  const { items, removeItem, clearCart, updateItemQuantity } = useCart();

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const TAX_RATE = 0.18;
  const tax = subtotal * TAX_RATE;
  const shipping = items.length > 0 ? 29.9 : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className={pageContainer}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Cart
        </h1>
        <Link
          href="/products"
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          Continue shopping →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/60 p-6 text-sm text-slate-300">
          Your cart is empty. Add a product from the products page.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[3fr,2fr]">
          {/* Cart items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-medium text-slate-100 hover:text-white"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-slate-400">
                    Unit price: {item.price.toFixed(2)}₺
                  </p>

                  {/* Quantity controls */}
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Quantity:</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateItemQuantity(
                          item.productId,
                          item.quantity - 1
                        )
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-[11px] text-slate-200 hover:border-white/50"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateItemQuantity(
                          item.productId,
                          item.quantity + 1
                        )
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-[11px] text-slate-200 hover:border-white/50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-semibold text-brand.accent">
                    {(item.price * item.quantity).toFixed(2)}₺
                  </span>
                  <button
                    className="text-[11px] text-slate-400 hover:text-red-400"
                    onClick={() => removeItem(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={`${softCard} space-y-4 text-sm`}>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Subtotal</span>
              <span className="font-semibold text-slate-100">
                {subtotal.toFixed(2)}₺
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Tax ({Math.round(TAX_RATE * 100)}% VAT)
              </span>
              <span className="font-semibold text-slate-100">
                {tax.toFixed(2)}₺
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Shipping</span>
              <span className="font-semibold text-slate-100">
                {shipping > 0 ? `${shipping.toFixed(2)}₺` : "Free"}
              </span>
            </div>

            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-200">Total</span>
                <span className="text-base font-semibold text-brand.accent">
                  {total.toFixed(2)}₺
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className={`${primaryButton} inline-flex w-full items-center justify-center text-center`}
            >
              Proceed to checkout
            </Link>

            <button
              className="w-full rounded-full border border-white/15 px-5 py-2 text-xs font-medium text-slate-200 hover:border-white/40"
              onClick={clearCart}
            >
              Clear cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
