import Link from "next/link";
import { notFound } from "next/navigation";
import type { Product } from "@/types/product";
import { ProductPurchaseActions } from "@/components/ProductPurchaseActions";
import { pageContainer, softCard, badgeStock } from "@/styles/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getProduct(slug: string): Promise<Product> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const res = await fetch(`${API_URL}/products/${slug}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch product (status ${res.status})`);
  }

  const data = await res.json();

  // If backend returns { product: {...} }
  if (data && data.product) {
    return data.product as Product;
  }

  // If backend returns the product directly
  return data as Product;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next 16: params is a Promise, we need to await it
  const { slug } = await params;

  const product = await getProduct(slug);

  const categoryName =
    product.category && typeof product.category === "object"
      ? (product.category as any).name
      : undefined;

  const images: string[] = product.images
    ? Array.isArray(product.images)
      ? product.images
      : [product.images]
    : [];

  const mainImage = images[0];

  return (
    <div className={pageContainer}>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
        <Link href="/products" className="hover:text-slate-200">
          Products
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-200 line-clamp-1">{product.name}</span>
      </div>

      <div className="grid gap-10 md:grid-cols-[3fr,2fr] md:items-start">
        <div className="space-y-4">
          {/* Main image */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="h-72 w-full object-contain md:h-80"
              />
            ) : (
              <div className="h-72 w-full bg-linear-to-r from-violet-500/70 via-indigo-500/50 to-amber-300/60 shadow-soft md:h-80" />
            )}
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/60"
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="h-16 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Contextual helper card */}
          <div className={softCard}>
            <p className="mb-1 text-xs font-semibold text-slate-100">
              Product snapshot
            </p>
            <p className="text-xs text-slate-300">
              This item is fetched from the Node.js + TypeScript + MongoDB
              backend and rendered via Next.js.
            </p>
          </div>
        </div>

        {/* Right: title, pricing, stock, specs, actions */}
        <div className="space-y-6">
          {/* Title + category */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {product.name}
            </h1>
            {categoryName && (
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                {categoryName}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-slate-300">
            {product.description ||
              "No description provided for this product yet. In a production setup, this would contain a short, conversion-focused description aligned with the game or app context."}
          </p>

          {/* Price + stock */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-2xl font-semibold text-brand.accent">
              {product.price.toFixed(2)}₺
            </span>
            <span className={badgeStock}>In stock: {product.stock}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-1">
            <ProductPurchaseActions
              productId={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              stock={product.stock}
            />
            <Link
              href="/products"
              className="rounded-full border border-white/15 px-5 py-2 text-xs font-medium text-slate-200 hover:border-white/40"
            >
              Back to products
            </Link>
          </div>


          {/* Specs + status */}
          <div className="grid gap-3 text-xs text-slate-300 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
              <p className="mb-1 text-[11px] font-semibold text-slate-100">
                Specifications
              </p>
              <dl className="space-y-1">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Category</dt>
                  <dd className="text-right text-slate-100">
                    {categoryName || "Uncategorized"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Backend ID</dt>
                  <dd className="text-right text-slate-100">
                    {product.id}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Slug</dt>
                  <dd className="text-right text-slate-100">
                    {product.slug}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Available stock</dt>
                  <dd className="text-right text-slate-100">
                    {product.stock}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
              <p className="mb-1 text-[11px] font-semibold text-slate-100">
                Status & metadata
              </p>
              <dl className="space-y-1">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Active</dt>
                  <dd className="text-right text-slate-100">
                    {product.isActive ? "Yes" : "No"}
                  </dd>
                </div>
                {product.createdAt && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-400">Created at</dt>
                    <dd className="text-right text-slate-100">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">Checkout rules</dt>
                  <dd className="text-right text-slate-100">
                    Available as long as stock &gt; 0 and product is active.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Customer reviews (static/demo) */}
      <section className="mt-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-white md:text-base">
            Customer reviews
          </h2>
          <span className="text-[11px] text-slate-500">
            Demo-only section to illustrate how review data could be presented.
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className={softCard}>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-100">
                High engagement
              </span>
              <span className="text-amber-300">★★★★☆</span>
            </div>
            <p className="text-xs text-slate-300">
              “This product would be a great candidate for playable ad
              creatives. Clear value, simple interaction, and it fits nicely
              into a mobile-friendly layout.”
            </p>
          </div>

          <div className={softCard}>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-100">
                Fast checkout experience
              </span>
              <span className="text-amber-300">★★★★★</span>
            </div>
            <p className="text-xs text-slate-300">
              “The flow from product detail to cart and checkout is minimal and
              focused — exactly what we want to optimize conversions in a
              playable funnel.”
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
