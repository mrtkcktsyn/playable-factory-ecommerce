"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginRequest } from "@/lib/auth";
import { card, label, textInput, primaryButton } from "@/styles/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginRequest(email, password);

      if (typeof window !== "undefined") {
        window.localStorage.setItem("playable-token", data.token);
        if (data.user) {
          window.localStorage.setItem(
            "playable-user",
            JSON.stringify(data.user)
          );
        }
      }

      router.push("/products");
      window.location.href = "/products";
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10 md:py-14">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Login
        </h1>
        <p className="text-sm text-slate-400">
          Sign in to place orders and access the customer || admin view.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`${card} space-y-4`}>
        <div>
          <label className={label}>Email</label>
          <input
            type="email"
            className={textInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={label}>Password</label>
          <input
            type="password"
            className={textInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button type="submit" disabled={loading} className={`${primaryButton} mt-12 cursor-pointer p-3 border-2 rounded flex justify-self-center flex-col w-60`}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="text-xs text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-brand.soft hover:text-brand.accent"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
