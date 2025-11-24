// src/app/page.tsx
import Link from "next/link";
import type { PaginatedProductsResponse, Product } from "@/types/product";
import {
  pageContainer,
  primaryButton,
  secondaryButton,
  pill,
  softCard,
  productsGrid,
  badgeStock,
} from "@/styles/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type CategoryLink = {
  label: string;
  value: string; // used as 'search' term
};

const categories: CategoryLink[] = [
  { label: "All products", value: "" },
  { label: "Headphones", value: "headphones" },
  { label: "Mouse", value: "mouse" },
  { label: "Keyboard", value: "keyboard" },
  { label: "Accessories", value: "accessories" },
];

async function fetchSectionProducts(
  query: string
): Promise<Product[]> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const url = `${API_URL}/products?${query}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch featured products:", res.status);
    return [];
  }

  const data = (await res.json()) as PaginatedProductsResponse;

  return data.items?.slice(0, 4) ?? [];
}

export default async function HomePage() {
  // Fetch two separate featured sections in parallel:
  // - newest products (createdAt desc)
  // - premium picks (price desc)
  const [newestProducts, premiumProducts] = await Promise.all([
    fetchSectionProducts("page=1&limit=4&sort=createdAt&order=desc"),
    fetchSectionProducts("page=1&limit=4&sort=price&order=desc"),
  ]);

  return (
    <div className={`${pageContainer} flex flex-col gap-12`}>
      {/* Hero */}
      <section className="grid gap-10 md:grid-cols-[3fr,2fr] md:items-center">
        <div className="space-y-6">
          <span className={pill}>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand.accent" />
            Playable Factory inspired ecommerce experience
          </span>

          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Turn your{" "}
            <span className="bg-linear-to-r from-brand.soft to-brand.accent bg-clip-text">
              game-like flows
            </span>{" "}
            into real ecommerce conversions.
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            This demo project is built for the Playable Factory Software
            Engineer case study. It showcases a full-stack ecommerce flow:
            products, stock logic, checkout, and an admin dashboard — all with a
            playful, ad-tech inspired UI.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/products" className={primaryButton}>
              View products
            </Link>
            <Link href="/admin/orders" className={secondaryButton}>
              View admin dashboard
            </Link>
            <span className="text-[11px] text-slate-400">
              Backend: Node.js · Express · TypeScript · MongoDB
            </span>
          </div>
        </div>

        {/* Summary Card */}
        <div className={softCard}>
          <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Live orders</span>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-200">
              Demo data
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2">
              <div>
                <p className="text-xs font-medium text-slate-100">
                  Wireless Headset Pro
                </p>
                <p className="text-[11px] text-slate-400">
                  Stock synced · 2 items
                </p>
              </div>
              <span className="text-xs font-semibold text-brand.accent">
                199.00₺
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2">
              <div>
                <p className="text-xs font-medium text-slate-100">
                  Gaming Mouse Ultra
                </p>
                <p className="text-[11px] text-slate-400">
                  Playable · High CTR
                </p>
              </div>
              <span className="text-xs font-semibold text-brand.accent">
                79.00₺
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2">
              <div>
                <p className="text-xs font-medium text-slate-100">
                  In-app Purchase Pack
                </p>
                <p className="text-[11px] text-slate-400">
                  Integrated with backend
                </p>
              </div>
              <span className="text-xs font-semibold text-brand.accent">
                49.00₺
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-[11px] text-slate-400">
              Orders sync in real-time with your backend.
            </span>
            <span className="text-[11px] font-semibold text-brand.soft">
              View all →
            </span>
          </div>
        </div>
      </section>

      {/* Category list (navigation to category pages) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-white md:text-base">
            Browse by category
          </h2>
          <Link
            href="/products"
            className="text-[11px] text-brand.soft hover:text-brand.accent"
          >
            View all products →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const href =
              cat.value === ""
                ? "/products"
                : `/products?search=${encodeURIComponent(cat.value)}`;

            return (
              <Link
                key={cat.label}
                href={href}
                className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-slate-200 hover:border-brand.primary/60"
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured section 1: Newest products */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-white md:text-base">
            New arrivals
          </h2>
          <span className="text-[11px] text-slate-500">
            Sorted by <span className="font-medium">createdAt (desc)</span>.
          </span>
        </div>

        {newestProducts.length === 0 ? (
          <p className="text-xs text-slate-500">
            No products found yet. Once you seed your database, this section
            will highlight the most recently added products.
          </p>
        ) : (
          <div className={productsGrid}>
            {newestProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className={`${softCard} group flex flex-col transition hover:border-brand.primary/60 hover:bg-slate-900`}
              >
                <div className="mb-3 flex h-32 justify-center rounded-xl">
                  <img
                    src={[product.images].toString()}
                    alt={product.name}
                    className="h-full w-full rounded-2xl border object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div className="space-y-1.5">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">
                      {product.name}
                    </h3>
                    <p className="line-clamp-2 text-xs text-slate-400">
                      {product.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand.accent">
                      {product.price.toFixed(2)}₺
                    </span>
                    <span className={badgeStock}>
                      In stock: {product.stock}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured section 2: Premium picks (sorted by price desc) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-white md:text-base">
            Premium picks
          </h2>
          <span className="text-[11px] text-slate-500">
            Sorted by <span className="font-medium">price (desc)</span>.
          </span>
        </div>

        {premiumProducts.length === 0 ? (
          <p className="text-xs text-slate-500">
            No products found yet.
          </p>
        ) : (
          <div className={productsGrid}>
            {premiumProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className={`${softCard} group flex flex-col transition hover:border-brand.primary/60 hover:bg-slate-900`}
              >
                <div className="mb-3 flex h-32 justify-center rounded-xl">
                  <img
                    src={[product.images].toString()}
                    alt={product.name}
                    className="h-full w-full rounded-2xl border object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div className="space-y-1.5">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">
                      {product.name}
                    </h3>
                    <p className="line-clamp-2 text-xs text-slate-400">
                      {product.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand.accent">
                      {product.price.toFixed(2)}₺
                    </span>
                    <span className={badgeStock}>
                      In stock: {product.stock}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
