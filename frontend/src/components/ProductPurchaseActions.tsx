"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { primaryButton } from "@/styles/ui";

type ProductPurchaseActionsProps = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
};

export function ProductPurchaseActions({
  productId,
  slug,
  name,
  price,
  stock,
}: ProductPurchaseActionsProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState<number>(1);

  // Adds the selected quantity of this product to the cart.
  const handleAddToCart = () => {
    if (quantity < 1) return;
    addItem(
      {
        productId,
        slug,
        name,
        price,
      },
      quantity
    );
  };

  // Guards quantity so it never goes below 1 or above available stock.
  const safeSetQuantity = (value: number) => {
    if (Number.isNaN(value) || value < 1) {
      setQuantity(1);
      return;
    }
    if (value > stock) {
      setQuantity(stock);
      return;
    }
    setQuantity(value);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">Quantity</span>
        <button
          type="button"
          onClick={() => safeSetQuantity(quantity - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-[11px] text-slate-200 hover:border-white/50"
        >
          -
        </button>
        <input
          type="number"
          min={1}
          max={stock}
          value={quantity}
          onChange={(e) => safeSetQuantity(Number(e.target.value))}
          className="h-8 w-16 rounded-lg border border-white/15 bg-slate-950 text-center text-xs text-slate-100 outline-none focus:border-brand.primary"
        />
        <button
          type="button"
          onClick={() => safeSetQuantity(quantity + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-[11px] text-slate-200 hover:border-white/50"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className={`${primaryButton} text-xs`}
      >
        Add to cart
      </button>
    </div>
  );
}
