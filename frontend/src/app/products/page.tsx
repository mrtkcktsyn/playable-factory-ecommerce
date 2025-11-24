import Link from "next/link";
import type { PaginatedProductsResponse, Product } from "@/types/product";
import {
  pageContainer,
  sectionHeader,
  productsGrid,
  softCard,
  badgeStock,
  filtersBar,
  filtersLeft,
  filtersFieldLabel,
  filtersInput,
  filtersSelect,
  filtersSearch,
  filtersActions,
} from "@/styles/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type SearchParamsType = Promise<
  Record<string, string | string[] | undefined>
>;

// Safely extract a string from searchParams
function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string {
  const val = searchParams[key];
  if (Array.isArray(val)) return val[0] ?? "";
  return val ?? "";
}

// Map UI sort value to backend sort + order
function mapSortForBackend(uiSort: string): { sort?: string; order?: string } {
  switch (uiSort) {
    case "price-asc":
      return { sort: "price", order: "asc" };
    case "price-desc":
      return { sort: "price", order: "desc" };
    case "newest":
      return { sort: "createdAt", order: "desc" };
    case "rating-desc":
      return { sort: "rating", order: "desc" };
    default:
      // Backend defaults: sort=createdAt, order=desc
      return {};
  }
}

// Build query string for API and links (skips empty values)
function buildQuery(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim() !== "") {
      qs.set(key, value);
    }
  });
  return qs.toString();
}

async function getProducts(
  searchParams: Record<string, string | string[] | undefined>
): Promise<PaginatedProductsResponse> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const category = getParam(searchParams, "category");
  const rawSearch = getParam(searchParams, "search");
  // If there is an explicit search term, use it.
  // Otherwise fall back to the selected category as a search keyword.
  const search = rawSearch || category;

  const uiSort = getParam(searchParams, "sort");
  const minPrice = getParam(searchParams, "minPrice");
  const maxPrice = getParam(searchParams, "maxPrice");
  const minRating = getParam(searchParams, "minRating");
  const page = getParam(searchParams, "page") || "1";

  const { sort, order } = mapSortForBackend(uiSort);

  const queryString = buildQuery({
    // We do not send "category" directly to the backend here,
    // because our category values are labels, not Mongo ObjectIds.
    search,
    sort, // backend sort field (createdAt / price / rating)
    order, // backend sort direction ("asc" | "desc")
    minPrice,
    maxPrice,
    minRating,
    page,
  });


  const url =
    queryString.length > 0
      ? `${API_URL}/products?${queryString}`
      : `${API_URL}/products`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response, just keep data as null
  }

  if (!res.ok) {
    console.error("Products API error:", res.status, data);
    throw new Error(
      data?.message || `Failed to fetch products (status ${res.status})`
    );
  }

  return data as PaginatedProductsResponse;
}

export default async function ProductsPage(props: {
  searchParams: SearchParamsType;
}) {
  const searchParams = await props.searchParams;

  const category = getParam(searchParams, "category");
  const search = getParam(searchParams, "search");
  const uiSort = getParam(searchParams, "sort");
  const minPrice = getParam(searchParams, "minPrice");
  const maxPrice = getParam(searchParams, "maxPrice");
  const minRating = getParam(searchParams, "minRating");
  const currentPage = Number(getParam(searchParams, "page") || "1");

  const { items, pagination } = await getProducts(searchParams);

  const totalPages = pagination.totalPages ?? 1;

  // Build URL for pagination links while preserving current filters
  const buildPageLink = (page: number) => {
    const q = buildQuery({
      category,
      search,
      sort: uiSort, // keep UI sort, it will be mapped again in getProducts
      minPrice,
      maxPrice,
      minRating,
      page: String(page),
    });
    return q.length > 0 ? `/products?${q}` : "/products";
  };

  return (
    <div className={pageContainer}>
      {/* Header */}
      <div className={sectionHeader}>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Products
          </h1>
          <p className="text-sm text-slate-400">
            Browse products fetched from the Express + MongoDB backend with
            filtering, search, sorting and pagination.
          </p>
        </div>
        <span className="text-xs text-slate-500">
          Showing {items.length} of {pagination.total} products
        </span>
      </div>

      {/* Filters / Search bar (responsive) */}
      <form action="/products" method="GET" className={filtersBar}>
        {/* Left side: filters */}
        <div className={filtersLeft}>
          <div>
            <label className={filtersFieldLabel}>Category</label>
            <select
              name="category"
              defaultValue={category}
              className={filtersSelect}
            >
              <option value="">All</option>
              <option value="headphones">Headphones</option>
              <option value="mouse">Mouse</option>
              <option value="keyboard">Keyboard</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          <div>
            <label className={filtersFieldLabel}>Min price</label>
            <input
              name="minPrice"
              type="number"
              min={0}
              defaultValue={minPrice}
              className={filtersInput}
              placeholder="0"
            />
          </div>

          <div>
            <label className={filtersFieldLabel}>Max price</label>
            <input
              name="maxPrice"
              type="number"
              min={0}
              defaultValue={maxPrice}
              className={filtersInput}
              placeholder="5000"
            />
          </div>

          <div>
            <label className={filtersFieldLabel}>Min rating</label>
            <select
              name="minRating"
              defaultValue={minRating}
              className={filtersSelect}
            >
              <option value="">All</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>

          <div>
            <label className={filtersFieldLabel}>Sort by</label>
            <select
              name="sort"
              defaultValue={uiSort}
              className={filtersSelect}
            >
              <option value="">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="rating-desc">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Right side: search + actions */}
        <div className="flex flex-1 flex-col gap-2 md:max-w-xs">
          <div>
            <label className={filtersFieldLabel}>Search</label>
            <input
              name="search"
              defaultValue={search}
              className={filtersSearch}
              placeholder="Search by product name…"
            />
          </div>

          <div className={filtersActions}>
            <button
              type="submit"
              className="rounded-full bg-brand.primary px-4 py-1.5 text-[11px] font-semibold text-white shadow-soft hover:bg-brand.soft"
            >
              Apply filters
            </button>

            <Link
              href="/products"
              className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-slate-200 hover:border-white/40"
            >
              Reset
            </Link>
          </div>
        </div>
      </form>

      {/* Products grid */}
      <div className={productsGrid}>
        {items.map((product: Product) => (
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
                <h2 className="line-clamp-2 text-sm font-semibold text-white">
                  {product.name}
                </h2>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
          <button
            type="button"
            disabled={currentPage <= 1}
            className="rounded-full border border-white/15 px-3 py-1 text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {currentPage > 1 ? (
              <Link href={buildPageLink(currentPage - 1)}>Previous</Link>
            ) : (
              "Previous"
            )}
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            const isActive = page === currentPage;
            return (
              <Link
                key={page}
                href={buildPageLink(page)}
                className={
                  isActive
                    ? "rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-900"
                    : "rounded-full border border-white/15 px-3 py-1 text-[11px] text-slate-200 hover:border-white/40"
                }
              >
                {page}
              </Link>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            className="rounded-full border border-white/15 px-3 py-1 text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {currentPage < totalPages ? (
              <Link href={buildPageLink(currentPage + 1)}>Next</Link>
            ) : (
              "Next"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
