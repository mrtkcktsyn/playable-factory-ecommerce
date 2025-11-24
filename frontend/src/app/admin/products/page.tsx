"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [draftStock, setDraftStock] = useState<Record<string, number>>({});

  // Check admin & fetch products
  useEffect(() => {
    if (!API_URL) {
      setError("API URL missing.");
      setLoading(false);
      return;
    }

    if (typeof window === "undefined") return;

    const rawUser = window.localStorage.getItem("playable-user");
    if (!rawUser) {
      setIsAdmin(false);
      setError("You must be logged in as admin to view this page.");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      if (user.role !== "admin") {
        setIsAdmin(false);
        setError("You are not authorized to view admin products.");
        setLoading(false);
        return;
      }
      setIsAdmin(true);
    } catch {
      setIsAdmin(false);
      setError("Invalid user data.");
      setLoading(false);
      return;
    }

    const token = window.localStorage.getItem("playable-token");
    if (!token) {
      setIsAdmin(false);
      setError("Missing token.");
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/products/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          setError("Not authorized.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(
            body.message ||
              `Failed to fetch admin products (status ${res.status}).`
          );
          setLoading(false);
          return;
        }

        const data = await res.json();

        let rawProducts: any[] = [];
        if (Array.isArray(data)) {
          rawProducts = data;
        } else if (Array.isArray((data as any).items)) {
          rawProducts = (data as any).items;
        }

        setProducts(
          rawProducts.map((p) => ({
            id: p.id ?? p._id ?? "",
            name: p.name,
            slug: p.slug,
            price: p.price,
            stock: p.stock,
            isActive: p.isActive,
            createdAt: p.createdAt,
          }))
        );
      } catch (err: any) {
        console.error("Admin products fetch error:", err);
        setError(err.message || "Unknown error.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Toggle product active/inactive
  const handleToggleActive = async (productId: string) => {
    if (!API_URL) return;
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("playable-token");
    if (!token) {
      setError("Missing token.");
      return;
    }

    try {
      setUpdatingId(productId);
      setError(null);

      const res = await fetch(`${API_URL}/products/${productId}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(
          body.message ||
            `Failed to toggle product status (status ${res.status}).`
        );
        return;
      }

      // Optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, isActive: !p.isActive } : p
        )
      );
    } catch (err: any) {
      console.error("Toggle product status error:", err);
      setError(err.message || "Unknown error while toggling status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Update product stock
  const handleUpdateStock = async (productId: string) => {
    if (!API_URL) return;
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("playable-token");
    if (!token) {
      setError("Missing token.");
      return;
    }

    const currentDraft = draftStock[productId];
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newStock =
      typeof currentDraft === "number" ? currentDraft : product.stock;

    try {
      setUpdatingId(productId);
      setError(null);

      const res = await fetch(`${API_URL}/products/${productId}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(
          body.message ||
            `Failed to update product stock (status ${res.status}).`
        );
        return;
      }

      // Optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, stock: newStock } : p
        )
      );
    } catch (err: any) {
      console.error("Update stock error:", err);
      setError(err.message || "Unknown error while updating stock.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-slate-300">Loading products…</p>
      </div>
    );
  }

  if (isAdmin === false || error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Admin Products
        </h1>
        <p className="text-sm text-red-400">
          {error || "You are not allowed to view this page."}
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Admin Products
        </h1>
        <p className="text-sm text-slate-300">
          No products found yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12 space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Admin Products
        </h1>
        <p className="text-xs text-slate-400">
          Manage product visibility and stock.
        </p>
      </div>

      <div className="space-y-3 text-sm">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-100">
                {product.name}
              </p>
              <p className="text-[11px] text-slate-500">
                slug: {product.slug}
              </p>
              <p className="text-xs text-slate-400">
                Price:{" "}
                <span className="font-semibold text-brand.accent">
                  {product.price.toFixed(2)}₺
                </span>
              </p>
              <p className="text-xs text-slate-400">
                Status:{" "}
                <span
                  className={
                    product.isActive
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }
                >
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 text-xs">
              {/* Stock controls */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Stock:</span>
                <input
                  type="number"
                  min={0}
                  value={
                    draftStock[product.id] ?? product.stock ?? 0
                  }
                  onChange={(e) =>
                    setDraftStock((prev) => ({
                      ...prev,
                      [product.id]: Number(e.target.value),
                    }))
                  }
                  className="h-8 w-20 rounded-lg border border-white/15 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:border-brand.primary"
                />
                <button
                  type="button"
                  disabled={updatingId === product.id}
                  onClick={() => handleUpdateStock(product.id)}
                  className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-slate-200 hover:border-white/50 disabled:opacity-50"
                >
                  Save
                </button>
              </div>

              {/* Active toggle */}
              <button
                type="button"
                disabled={updatingId === product.id}
                onClick={() => handleToggleActive(product.id)}
                className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-slate-200 hover:border-white/50 disabled:opacity-50"
              >
                {product.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
