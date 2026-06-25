"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/lib/products";
import { cn } from "@/lib/cn";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialQuery = searchParams.get("q") || "";

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialQuery);
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc" | "rating">(
    "default"
  );
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const filtered = useMemo(() => {
    let result =
      category === "All"
        ? [...products]
        : products.filter((p) => p.category === category);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false)
      );
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [category, search, sort]);

  useEffect(() => {
    setCategory(searchParams.get("category") || "All");
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [category, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  return (
    <div className="mesh-bg min-h-screen pb-16">
      <div className="container-app pt-8 sm:pt-10">
        <h1 className="section-title">
          {category === "All" ? "All Products" : category}
        </h1>
        {search.trim() && (
          <p className="mt-2 text-sm text-slate-500">
            Results for &ldquo;{search.trim()}&rdquo;
          </p>
        )}

        <div className="mb-8 mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field input-field-icon"
            />
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal className="hidden h-4 w-4 text-slate-400 sm:block" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="input-field w-auto min-w-[180px] cursor-pointer"
            >
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                category === cat
                  ? "bg-primary-600 text-white shadow-primary"
                  : "card text-slate-600 hover:border-primary-200 hover:text-primary-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card border-dashed py-20 text-center">
            <p className="text-lg font-semibold text-slate-700">No products found</p>
            <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm font-medium text-slate-500">
              Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""} · Page{" "}
              {safePage} of {totalPages}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pageItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  className={cn(
                    "btn-secondary px-4 py-2 text-sm",
                    safePage === 1 && "pointer-events-none opacity-50"
                  )}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: totalPages }).slice(0, 12).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "rounded-xl px-3 py-2 text-sm font-semibold transition",
                          safePage === p
                            ? "bg-primary-600 text-white shadow-primary"
                            : "card text-slate-600 hover:border-primary-200 hover:text-primary-700"
                        )}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  className={cn(
                    "btn-secondary px-4 py-2 text-sm",
                    safePage === totalPages && "pointer-events-none opacity-50"
                  )}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
