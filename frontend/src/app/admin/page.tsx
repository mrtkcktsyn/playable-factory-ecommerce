"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  pageContainer,
  softCard,
  dashboardHeader,
  statsGrid,
  statsCard,
  statsLabel,
  statsValue,
  statsSub,
  statusPillsRow,
  statusPillBase,
  recentList,
  miniBarRow,
  miniBarTrack,
  miniBarFill,
} from "@/styles/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  return (
    o.totalPrice ??
    o.totalAmount ??
    o.amount ??
    0
  );
}

function getOrderId(o: Order): string {
  return (o.id || o._id || "").toString();
}

function getUserKey(u: OrderUser | undefined): string | null {
  if (!u) return null;
  return (u.id || u._id || u.email || u.name || "").toString() || null;
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

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdminOrders() {
      try {
        if (!API_URL) {
          setError("API URL is not configured.");
          setLoading(false);
          return;
        }

        const token = window.localStorage.getItem("playable-token");
        if (!token) {
          setError("You must be logged in as an admin to view this page.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          console.error("Failed to fetch admin orders:", res.status, data);
          if (res.status === 401 || res.status === 403) {
            setError(
              data?.message ||
                "Unauthorized. Please log in with an admin account."
            );
          } else {
            setError(
              data?.message ||
                `Failed to fetch admin orders (status ${res.status}).`
            );
          }
          setLoading(false);
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
        console.error("Error while fetching admin orders:", err);
        setError(
          err?.message || "An unexpected error occurred while fetching orders."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAdminOrders();
  }, []);

  const totalOrders = orders.length;

  const totalRevenue = orders.reduce(
    (sum, o) => sum + getOrderTotal(o),
    0
  );

  const uniqueCustomers = (() => {
    const set = new Set<string>();
    for (const o of orders) {
      const key = getUserKey(o.user);
      if (key) set.add(key);
    }
    return set.size;
  })();

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    const s = getStatusLabel(o.status);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const totalForStatus = Object.values(statusCounts).reduce(
    (a, b) => a + b,
    0
  );

  const dailyMap = new Map<string, number>();
  for (const o of orders) {
    if (!o.createdAt) continue;
    const d = new Date(o.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
  }
  const dailyArray = Array.from(dailyMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-7);
  const maxDailyCount =
    dailyArray.reduce((max, [, count]) => Math.max(max, count), 0) || 1;

  const recentOrders = [...orders]
    .sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    })
    .slice(0, 5);

  return (
    <div className={pageContainer}>
      {/* Header */}
      <div className={dashboardHeader}>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Admin dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Overview of orders, revenue and customer activity powered
            by the same backend used by the customer-facing experience.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <Link
            href="/admin/orders"
            className="rounded-full border border-white/15 px-3 py-1 font-medium text-slate-200 hover:border-white/40"
          >
            Manage orders
          </Link>
          <span>
            {totalOrders} total orders • {uniqueCustomers} customers
          </span>
        </div>
      </div>

      {/* Loading / Error states */}
      {loading && (
        <p className="text-xs text-slate-400">
          Loading admin analytics…
        </p>
      )}

      {!loading && error && (
        <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-100">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Top stats */}
          <section className={statsGrid}>
            <div className={statsCard}>
              <p className={statsLabel}>Total revenue</p>
              <p className={statsValue}>{totalRevenue.toFixed(2)}₺</p>
              <p className={statsSub}>
                Sum of all order totals coming from the MongoDB orders
                collection.
              </p>
            </div>

            <div className={statsCard}>
              <p className={statsLabel}>Total orders</p>
              <p className={statsValue}>{totalOrders}</p>
              <p className={statsSub}>
                All orders placed through the checkout flow, including different
                statuses.
              </p>
            </div>

            <div className={statsCard}>
              <p className={statsLabel}>Unique customers</p>
              <p className={statsValue}>{uniqueCustomers}</p>
              <p className={statsSub}>
                Counted by unique user id / email associated with orders.
              </p>
            </div>
          </section>

          {/* Middle row: status distribution + daily chart */}
          <section className="mt-8 grid gap-4 md:grid-cols-[2fr,3fr]">
            {/* Status distribution */}
            <div className={softCard}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  Order status distribution
                </h2>
                <span className="text-[11px] text-slate-500">
                  {totalForStatus} total orders
                </span>
              </div>

              {totalForStatus === 0 ? (
                <p className="text-[11px] text-slate-500">
                  No orders yet.
                </p>
              ) : (
                <div className={statusPillsRow}>
                  {Object.entries(statusCounts).map(
                    ([status, count]) => {
                      const percentage = Math.round(
                        (count / totalForStatus) * 100
                      );

                      let colorClass =
                        "border-slate-500/40 text-slate-200 bg-slate-900/60";
                      if (
                        status === "completed" ||
                        status === "delivered"
                      ) {
                        colorClass =
                          "border-emerald-400/40 text-emerald-200 bg-emerald-500/10";
                      } else if (status === "pending") {
                        colorClass =
                          "border-amber-400/40 text-amber-200 bg-amber-500/10";
                      } else if (status === "cancelled") {
                        colorClass =
                          "border-red-400/40 text-red-200 bg-red-500/10";
                      }

                      return (
                        <span
                          key={status}
                          className={`${statusPillBase} ${colorClass}`}
                        >
                          <span className="capitalize">{status}</span>
                          <span className="opacity-80">
                            {count} • {percentage}%
                          </span>
                        </span>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* Orders over time */}
            <div className={softCard}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  Orders over time
                </h2>
                <span className="text-[11px] text-slate-500">
                  Last {dailyArray.length} days
                </span>
              </div>

              {dailyArray.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  No orders with a valid creation date yet. Once you create some
                  orders, you&apos;ll see a simple trend visualization here.
                </p>
              ) : (
                <div className="space-y-2">
                  {dailyArray.map(([date, count]) => {
                    const ratio = count / maxDailyCount;
                    return (
                      <div key={date} className={miniBarRow}>
                        <span className="w-20 text-slate-400">
                          {date.slice(5)} {/* MM-DD */}
                        </span>
                        <div className={miniBarTrack}>
                          <div
                            className={miniBarFill}
                            style={{
                              width: `${Math.max(ratio * 100, 10)}%`,
                            }}
                          />
                        </div>
                        <span className="w-6 text-right text-slate-200">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Recent orders */}
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Recent orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-[11px] text-brand.soft hover:text-brand.accent"
              >
                View all →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                No orders yet. Place an order through the customer flow to see
                it appear here.
              </p>
            ) : (
              <div className={recentList}>
                {recentOrders.map((o) => (
                  <div
                    key={getOrderId(o)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-slate-200">
                        {o.user?.email ||
                          o.user?.name ||
                          "Unknown customer"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {getStatusLabel(o.status)} •{" "}
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
          </section>
        </>
      )}
    </div>
  );
}
