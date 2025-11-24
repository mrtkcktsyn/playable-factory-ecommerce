"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_URL) {
      setError("API URL missing");
      setLoading(false);
      return;
    }

    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("playable-token")
        : null;

    if (!token) {
      setError("You must be logged in to view your orders.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          setError("Not authorized. Please login again.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(
            body.message ||
              `Failed to fetch orders (status ${res.status}).`
          );
          setLoading(false);
          return;
        }

        const data = await res.json();
        let rawOrders: any[] = [];

        if (Array.isArray(data)) {
          rawOrders = data;
        } else if (Array.isArray((data as any).items)) {
          rawOrders = (data as any).items;
        } else if (Array.isArray((data as any).orders)) {
          rawOrders = (data as any).orders;
        } else {
          rawOrders = [];
        }

        setOrders(
          rawOrders.map((o) => ({
            id: o.id ?? o._id ?? "",
            items: o.items ?? [],
            totalAmount: o.totalAmount ?? 0,
            status: o.status ?? "pending",
            paymentStatus: o.paymentStatus,
            createdAt: o.createdAt,
          }))
        );
      } catch (err: any) {
        console.error("My orders fetch error:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-slate-300">Loading your orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-4">
        <p className="text-sm text-red-400">{error}</p>
        <Link
          href="/login"
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          Go to login →
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          My Orders
        </h1>
        <p className="text-sm text-slate-300">
          You don&apos;t have any orders yet.
        </p>
        <Link
          href="/products"
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          Browse products →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          My Orders
        </h1>
        <Link
          href="/products"
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          Continue shopping →
        </Link>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm"
          >
            <div className="mb-3 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-slate-100">
                  Order #{order.id.slice(-6)}
                </p>
                {order.createdAt && (
                  <p className="text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="text-right text-[11px]">
                <p className="font-medium text-brand.accent">
                  {order.totalAmount.toFixed(2)}₺
                </p>
                <p className="text-slate-400">
                  Status:{" "}
                  <span className="capitalize">{order.status}</span>
                </p>
                {order.paymentStatus && (
                  <p className="text-slate-500">
                    Payment:{" "}
                    <span className="capitalize">
                      {order.paymentStatus}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1 border-t border-white/10 pt-3 text-xs text-slate-300">
              {order.items.map((item: any, idx: number) => {
                const rawProduct = item.product;
                const productName =
                  rawProduct && typeof rawProduct === "object"
                    ? rawProduct.name
                    : item.productName ??
                      item.name ??
                      "Product";

                const quantity = item.quantity ?? item.qty ?? 1;
                const unitPrice = item.price ?? item.unitPrice ?? 0;
                const lineTotal = unitPrice * quantity;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {productName}{" "}
                      <span className="text-slate-500">× {quantity}</span>
                    </span>
                    <span className="font-semibold text-brand.accent">
                      {lineTotal.toFixed(2)}₺
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
