"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUSES = ["pending", "processing", "completed", "cancelled"];

type AdminOrder = Order & {
  user?: any;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!API_URL) {
      setError("API URL missing");
      setLoading(false);
      return;
    }

    if (typeof window === "undefined") return;

    // Simple admin check - read user.role from LocalStorage
    const rawUser = window.localStorage.getItem("playable-user");
    if (!rawUser) {
      setIsAdmin(false);
      setLoading(false);
      setError("You must be logged in as admin to view this page.");
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      if (user.role !== "admin") {
        setIsAdmin(false);
        setLoading(false);
        setError("You are not authorized to view admin orders.");
        return;
      }
      setIsAdmin(true);
    } catch {
      setIsAdmin(false);
      setLoading(false);
      setError("Invalid user data.");
      return;
    }

    const token = window.localStorage.getItem("playable-token");
    if (!token) {
      setIsAdmin(false);
      setLoading(false);
      setError("Missing token.");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/orders`, {
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
            body.message || `Failed to fetch admin orders (status ${res.status}).`
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
        }

        setOrders(
          rawOrders.map((o) => ({
            id: o.id ?? o._id ?? "",
            items: o.items ?? [],
            totalAmount: o.totalAmount ?? 0,
            status: o.status ?? "pending",
            paymentStatus: o.paymentStatus,
            createdAt: o.createdAt,
            user: o.user,
          }))
        );
      } catch (err: any) {
        console.error("Admin orders fetch error:", err);
        setError(err.message || "Unknown error.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!API_URL) return;
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("playable-token");
    if (!token) {
      setError("Missing token.");
      return;
    }

    try {
      setUpdatingId(orderId);
      setError(null);

      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(
          body.message ||
            `Failed to update order status (status ${res.status}).`
        );
        return;
      }

      // optimistic update
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err: any) {
      console.error("Update status error:", err);
      setError(err.message || "Unknown error while updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-slate-300">Loading admin orders…</p>
      </div>
    );
  }

  if (isAdmin === false || error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Admin Orders
        </h1>
        <p className="text-sm text-red-400">
          {error || "You are not allowed to view this page."}
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Admin Orders
        </h1>
        <p className="text-sm text-slate-300">
          No orders found yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Admin Orders
        </h1>
        <p className="text-xs text-slate-400">
          Manage all orders in the system.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const user =
            typeof order.user === "string" ? null : (order.user as any);

          return (
            <div
              key={order.id}
              className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-100">
                    Order #{order.id.slice(-6)}
                  </p>
                  {order.createdAt && (
                    <p className="text-slate-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  )}
                  {user && (
                    <p className="text-slate-400">
                      {user.name} ·{" "}
                      <span className="text-slate-500">{user.email}</span>
                    </p>
                  )}
                </div>

                <div className="text-right text-[11px] space-y-1">
                  <p className="font-medium text-brand.accent">
                    {order.totalAmount.toFixed(2)}₺
                  </p>
                  {order.paymentStatus && (
                    <p className="text-slate-400">
                      Payment:{" "}
                      <span className="capitalize">
                        {order.paymentStatus}
                      </span>
                    </p>
                  )}
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-slate-400">Status:</span>
                    <select
                      className="rounded-full border border-white/15 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none"
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1 border-t border-white/10 pt-3 text-xs text-slate-300">
                {order.items.map((item, idx) => {
                  const product =
                    typeof item.product === "string"
                      ? null
                      : (item.product as any);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <span>
                        {product?.name ?? "Product"}{" "}
                        <span className="text-slate-500">
                          × {item.quantity}
                        </span>
                      </span>
                      <span className="font-semibold text-brand.accent">
                        {(item.price * item.quantity).toFixed(2)}₺
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
