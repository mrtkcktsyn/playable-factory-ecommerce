// src/app/register/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerRequest } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await registerRequest(name, email, password);

      window.localStorage.setItem("playable-token", data.token);
      if (data.user) {
        window.localStorage.setItem("playable-user", JSON.stringify(data.user));
      }

      router.push("/products");
    } catch (err: any) {
      setError(err.message || "Register failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10 md:py-14">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Create account
        </h1>
        <p className="text-sm text-slate-400">
          Join the playableEcommerce demo and start placing test orders.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-sm"
      >
        <div>
          <label className="block text-xs font-medium text-slate-300">
            Name
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand.primary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300">
            Email
          </label>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand.primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300">
            Password
          </label>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand.primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-brand.primary px-5 py-2 text-xs font-semibold text-white shadow-soft hover:bg-brand.soft disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-xs text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand.soft hover:text-brand.accent"
        >
          Login
        </Link>
      </p>
    </div>
  );
}
