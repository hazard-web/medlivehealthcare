"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  BadgeCheck,
  ChevronRight,
  Package,
} from "lucide-react";
import ProductRating from "@/components/ProductRating";
import ProductReviewsBreakdown from "@/components/ProductReviewsBreakdown";
import ProductReviewList from "@/components/ProductReviewList";
import ProductComplianceSection from "@/components/ProductComplianceSection";
import { getProductReviews } from "@/lib/product-reviews";
import { getProductById, formatPrice, getDiscountPercent, products } from "@/lib/products";
import NitrilePurchaseBlock from "@/components/NitrilePurchaseBlock";
import StandardPurchaseBlock from "@/components/StandardPurchaseBlock";
import ProductImage from "@/components/ProductImage";
import { useMemo, useState, useRef } from "react";
import { cn } from "@/lib/cn";
import {
  nitrileDiscountPercent,
  nitrileOriginalPrice,
  nitrileUnitPrice,
  NitrilePackSize,
} from "@/lib/nitrile-pricing";
import { productGalleryById } from "@/lib/product-images";
import MedLiveWatermark from "@/components/MedLiveWatermark";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = getProductById(id);
  const [activeImage, setActiveImage] = useState(0);
  const [nitrilePackSize, setNitrilePackSize] = useState<NitrilePackSize>(50);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectImage = (idx: number) => {
    setActiveImage(idx);
    thumbRefs.current[idx]?.focus();
  };

  if (!product) notFound();

  const discount = getDiscountPercent(product);
  const gallery = productGalleryById[product.id] ?? [product.image];
  const showMedLiveWatermark = product.id.startsWith("nitrile-gloves-");
  const isNitrileProduct = product.id.startsWith("nitrile-gloves-");

  const displayPrice = isNitrileProduct ? nitrileUnitPrice(nitrilePackSize) : product.price;
  const displayOriginal = isNitrileProduct
    ? nitrileOriginalPrice(nitrilePackSize)
    : product.originalPrice;
  const displayDiscount = isNitrileProduct
    ? nitrileDiscountPercent(nitrilePackSize)
    : discount;
  const displayUnit = isNitrileProduct
    ? `per box of ${nitrilePackSize} gloves`
    : product.unit;

  const writtenReviews = useMemo(
    () => getProductReviews(product.id, product.category),
    [product.id, product.category]
  );

  const sizeOptions = useMemo(() => {
    const pid = product.id;
    const group =
      pid.startsWith("adult-choice-pants-")
        ? "adult-choice-pants-"
        : pid.startsWith("respect-adult-pants-")
          ? "respect-adult-pants-"
          : pid.startsWith("nitrile-gloves-")
            ? "nitrile-gloves-"
            : pid.startsWith("latex-exam-gloves-")
              ? "latex-exam-gloves-"
              : null;

    if (!group) return [];

    const options = products
      .filter((p) => p.id.startsWith(group))
      .map((p) => ({
        id: p.id,
        label: (() => {
          if (group.includes("pants-")) {
            const m = p.name.match(/\(([^)]+)\)\s*$/);
            return m ? m[1] : p.name;
          }
          const m = p.name.match(/\((Small|Medium|Large)\)\s*$/i);
          return m ? m[1] : p.name;
        })(),
        price: p.price,
      }))
      .filter((p) => p.label && typeof p.label === "string");

    const order =
      group.includes("pants-")
        ? ["S", "M", "L", "XL", "XXL", "XXXL"]
        : ["Small", "Medium", "Large"];

    options.sort((a, b) => {
      const ai = order.indexOf(a.label);
      const bi = order.indexOf(b.label);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return String(a.label).localeCompare(String(b.label));
    });

    return options;
  }, [product.id]);

  const currentSizeLabel = useMemo(() => {
    const pid = product.id;
    if (pid.startsWith("adult-choice-pants-") || pid.startsWith("respect-adult-pants-")) {
      const m = product.name.match(/\(([^)]+)\)\s*$/);
      return m ? m[1] : null;
    }
    if (pid.startsWith("nitrile-gloves-") || pid.startsWith("latex-exam-gloves-")) {
      const m = product.name.match(/\((Small|Medium|Large)\)\s*$/i);
      return m ? m[1] : null;
    }
    return null;
  }, [product.id, product.name]);

  return (
    <div className="mesh-bg min-h-screen">
      <div className="container-app py-10 sm:py-12">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-primary-700">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-primary-700">
            Products
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-primary-700"
          >
            {product.category}
          </Link>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-[104px_1fr] lg:items-start">
            <div
              className="order-2 flex gap-3 overflow-x-auto scroll-p-2 p-1.5 lg:order-1 lg:flex-col lg:overflow-visible lg:sticky lg:top-28"
              role="tablist"
              aria-label="Product images"
            >
              {gallery.map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  role="tab"
                  ref={(el) => {
                    thumbRefs.current[idx] = el;
                  }}
                  onClick={() => selectImage(idx)}
                  onFocus={() => setActiveImage(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                      e.preventDefault();
                      selectImage(Math.min(idx + 1, gallery.length - 1));
                    }
                    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      selectImage(Math.max(idx - 1, 0));
                    }
                  }}
                  className={cn(
                    "relative h-[72px] w-[72px] shrink-0 rounded-xl bg-white p-0.5 transition outline-none",
                    idx === activeImage
                      ? "border-2 border-primary-600"
                      : "border border-border hover:border-primary-300 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
                  )}
                  aria-label={`View image ${idx + 1}`}
                  aria-selected={idx === activeImage}
                >
                  <span className="relative block h-full w-full overflow-hidden rounded-[10px]">
                    <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                    {showMedLiveWatermark && src.includes("/products/medlive/") && (
                      <MedLiveWatermark variant="thumb" />
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div className="card relative order-1 aspect-square overflow-hidden bg-white lg:order-2">
              <div className="relative h-full w-full overflow-hidden">
                <ProductImage
                  key={gallery[Math.min(activeImage, gallery.length - 1)]}
                  src={gallery[Math.min(activeImage, gallery.length - 1)]}
                  alt={product.name}
                  productId={product.id}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain bg-white p-6"
                />
                {showMedLiveWatermark && (
                  <div className="absolute inset-6 overflow-hidden">
                    <MedLiveWatermark variant="detail" />
                  </div>
                )}
              </div>
              {displayDiscount && (
                <span className="badge-sale absolute left-4 top-4 z-10">
                  -{displayDiscount}%
                </span>
              )}
            </div>
          </div>

          <ProductReviewsBreakdown
            className="lg:col-span-1"
            rating={product.rating}
            reviews={product.reviews}
          />
          <ProductReviewList className="mt-1" reviews={writtenReviews} />
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="flex flex-wrap items-center gap-2">
              {product.brand && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {product.brand}
                </span>
              )}
              <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-800 ring-1 ring-primary-100">
                {product.category}
              </span>
              {currentSizeLabel && (
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-border">
                  Size: {currentSizeLabel}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {product.name}
            </h1>

            <ProductRating className="mt-3" rating={product.rating} reviews={product.reviews} />

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                {formatPrice(displayPrice)}
              </p>
              {displayOriginal && displayOriginal > displayPrice && (
                <p className="text-lg font-semibold text-slate-400 line-through">
                  {formatPrice(displayOriginal)}
                </p>
              )}
              {displayDiscount && (
                <span className="text-sm font-semibold text-primary-700">
                  {displayDiscount}% Off
                </span>
              )}
            </div>

            {displayUnit && <p className="mt-1 text-sm text-slate-500">{displayUnit}</p>}

            <p className="mt-5 text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>

            {sizeOptions.length > 1 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-800">
                  Also Available in Following Sizes
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizeOptions.map((s) => {
                    const isCurrent = s.id === product.id;
                    return (
                    <Link
                      key={s.id}
                      href={`/products/${s.id}`}
                      aria-disabled={isCurrent}
                      aria-current={isCurrent ? "page" : undefined}
                      className={cn(
                        "inline-flex h-16 min-w-16 flex-col items-center justify-center rounded-md border px-3 text-center transition",
                        isCurrent
                          ? "border-primary-600 bg-primary-600 text-white pointer-events-none"
                          : "border-primary-200 bg-primary-50 text-primary-800 hover:border-primary-300 hover:bg-primary-100"
                      )}
                    >
                      <span className="text-sm font-bold leading-none">{s.label}</span>
                      <span
                        className={cn(
                          "mt-1 text-[10px] font-semibold leading-none",
                          isCurrent ? "text-white/90" : "text-primary-700/80"
                        )}
                      >
                        {formatPrice(isNitrileProduct ? nitrileUnitPrice(nitrilePackSize) : s.price)}
                      </span>
                    </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {isNitrileProduct ? (
              <NitrilePurchaseBlock
                product={product}
                packSize={nitrilePackSize}
                onPackSizeChange={setNitrilePackSize}
              />
            ) : (
              <StandardPurchaseBlock product={product} />
            )}

            <div className="mt-10 grid gap-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Description</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.description}</p>
                {product.features.length > 0 && (
                  <ul className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-primary-700" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">Key Specifications</h2>
                <div className="mt-3 card overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="[&>tr]:border-b [&>tr]:border-border [&>tr:last-child]:border-b-0">
                      <tr className="bg-white">
                        <td className="w-1/2 px-4 py-3 font-semibold text-slate-700">Brand</td>
                        <td className="px-4 py-3 text-slate-600">{product.brand ?? "—"}</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-4 py-3 font-semibold text-slate-700">Category</td>
                        <td className="px-4 py-3 text-slate-600">{product.category}</td>
                      </tr>
                      {displayUnit && (
                        <tr className="bg-white">
                          <td className="px-4 py-3 font-semibold text-slate-700">Pack</td>
                          <td className="px-4 py-3 text-slate-600">{displayUnit}</td>
                        </tr>
                      )}
                      <tr className="bg-white">
                        <td className="px-4 py-3 font-semibold text-slate-700">Availability</td>
                        <td className="px-4 py-3 text-slate-600">
                          {product.inStock ? "In stock" : "Out of stock"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <ProductComplianceSection productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
