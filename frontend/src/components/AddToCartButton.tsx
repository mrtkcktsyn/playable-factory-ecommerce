"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Props = {
  productId: string;
  name: string;
  slug: string;
  price: number;
};

export function AddToCartButton({ productId, name, slug, price }: Props) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const handleClick = () => {
    setAdding(true);
    addItem({
      productId,
      name,
      slug,
      price,
      quantity: 1,
    });
    setTimeout(() => setAdding(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-slate-900 shadow-soft hover:bg-slate-100 disabled:opacity-60"
      disabled={adding}
    >
      {adding ? "Added!" : "Add to cart"}
    </button>
  );
}