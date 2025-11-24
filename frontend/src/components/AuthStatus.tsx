// src/components/AuthStatus.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("playable-user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setHydrated(true);
  }, []);

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("playable-token");
    window.localStorage.removeItem("playable-user");
    setUser(null);
    window.location.href = "/";
  };

  // SSR flash'ını engellemek için
  if (!hydrated) {
    return null;
  }

  // Login olmamış kullanıcı
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-slate-200 hover:border-white/30"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-soft hover:bg-slate-100"
        >
          Register
        </Link>
      </div>
    );
  } else {
    // Login olmuş kullanıcı (user + admin farkı)
    const isAdmin = user.role === "admin";

    return (
      <div className="flex items-center gap-2">
        <Link
          href="/orders"
          className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-slate-200 hover:border-white/30"
        >
          Order History
        </Link>

        {isAdmin && (
          <Link
            href="/admin/orders"
            className="rounded-full border border-amber-400/40 px-4 py-1.5 text-xs font-medium text-amber-200 hover:border-amber-300"
          >
            All Orders
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="rounded-full border border-red-400/40 px-4 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/10"
        >
          Logout
        </button>
      </div>
    );
  }


}
