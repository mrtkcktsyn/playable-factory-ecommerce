"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { pageContainer, softCard, primaryButton } from "@/styles/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ProfileUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type OrderUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
};

type Order = {
  id?: string;
  _id?: string;
  totalPrice?: number;
  totalAmount?: number;
  amount?: number;
  status?: string;
  createdAt?: string;
  user?: OrderUser;
};

function getOrderTotal(o: Order): number {
  return o.totalPrice ?? o.totalAmount ?? o.amount ?? 0;
}

function formatDate(d?: string): string {
  if (!d) return "-";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

function getStatusLabel(status?: string): string {
  if (!status) return "unknown";
  return status.toLowerCase();
}

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_URL) {
      setError("NEXT_PUBLIC_API_URL is not defined.");
      setLoading(false);
      setOrdersLoading(false);
      return;
    }

    const storedUser =
      typeof window !== "undefined"
        ? window.localStorage.getItem("playable-user")
        : null;
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("playable-token")
        : null;

    if (!storedUser || !token) {
      setError("You need to be logged in to view your profile.");
      setLoading(false);
      setOrdersLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    } catch {
      setError("Could not parse stored user data.");
    } finally {
      setLoading(false);
    }

    async function fetchMyOrders() {
      try {
        const res = await fetch(`${API_URL}/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setError(
            data?.message ||
              `Failed to fetch your orders (status ${res.status}).`
          );
          setOrders([]);
          return;
        }

        if (Array.isArray(data)) {
          setOrders(data as Order[]);
        } else if (Array.isArray(data.orders)) {
          setOrders(data.orders as Order[]);
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        setError(
          err?.message || "An unexpected error occurred while fetching orders."
        );
      } finally {
        setOrdersLoading(false);
      }
    }

    fetchMyOrders();
  }, []);

  const recentOrders = [...orders]
    .sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    })
    .slice(0, 5);

  return (
    <div className={pageContainer}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Profile
        </h1>
        <p className="text-sm text-slate-400">
          View your account details and a quick snapshot of your recent orders.
        </p>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading profile…</p>
      ) : error && !user ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-100">
          {error}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
          {/* Left: user info */}
          <section className={`${softCard} space-y-4 text-sm`}>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Account
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                {user?.name || "Unnamed user"}
              </h2>
              <p className="text-xs text-slate-400">
                {user?.email || "No email available"}
              </p>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Role</span>
                <span className="rounded-full border border-white/15 px-2 py-0.5 text-[11px]">
                  {user?.role || "customer"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Orders placed</span>
                <span className="font-semibold text-slate-100">
                  {orders.length}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Profile data is derived from the authenticated user object returned
              by the backend on login. In a production-ready setup, this section
              could be extended with editable fields and password management.
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <Link href="/orders" className={primaryButton}>
                View full order history
              </Link>
            </div>
          </section>

          {/* Right: recent orders */}
          <section className={`${softCard} space-y-3 text-sm`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100">
                Recent orders
              </h2>
              <span className="text-[11px] text-slate-500">
                Last {recentOrders.length} orders
              </span>
            </div>

            {ordersLoading ? (
              <p className="text-[11px] text-slate-400">
                Loading your orders…
              </p>
            ) : recentOrders.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                You have not placed any orders yet. Once you do, they will show
                up here.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {recentOrders.map((o) => (
                  <div
                    key={(o.id || o._id || "").toString()}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-slate-200">
                        {getStatusLabel(o.status)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatDate(o.createdAt)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-brand.accent">
                      {getOrderTotal(o).toFixed(2)}₺
                    </span>
                  </div>
                ))}
              </div>
            )}

            {error && user && (
              <p className="text-[11px] text-red-400">{error}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
