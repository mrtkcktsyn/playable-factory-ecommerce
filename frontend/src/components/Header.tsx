"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StoredUser = {
  name?: string;
  email?: string;
  role?: string;
};

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("playable-token");
    const userRaw = window.localStorage.getItem("playable-user");

    setIsLoggedIn(!!token);

    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        setUser(parsed);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("playable-token");
    window.localStorage.removeItem("playable-user");
    window.location.href = "/"; // simple redirect after logout
  };

  return (
    <header className="relative z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-slate-100"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand.primary text-[10px] font-bold text-slate-950">
            PE
          </span>
          PLAYABLE·ECOMMERCE
        </Link>

        {/* Center: navigation */}
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/products" className="hover:text-white">
            Products
          </Link>
          <Link href="/cart" className="hover:text-white">
            Cart
          </Link>
          {isLoggedIn && (
            <Link href="/profile" className="hover:text-white">
              Profile
            </Link>
          )}
        </nav>

        {/* Right: auth & shortcuts */}
        <div className="flex items-center gap-2 text-[11px]">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="rounded-full border border-white/20 px-3 py-1 text-slate-200 hover:border-white/50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-brand.primary px-3 py-1 font-semibold text-slate-950 hover:bg-brand.soft"
              >
                Get started
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/orders"
                className="rounded-full border border-white/15 px-3 py-1 text-slate-200 hover:border-white/40"
              >
                Order History
              </Link>

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-full border border-amber-300/40 bg-amber-500/10 px-3 py-1 font-medium text-amber-200 hover:border-amber-300/70"
                >
                  All Orders
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1 text-red-200 hover:border-red-300"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
