"use client";

import Link from "next/link";
import { Star, ShoppingCart, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, getDiscountPercent } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import ProductImage from "@/components/ProductImage";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { productHoverImageById } from "@/lib/product-images";
import MedLiveWatermark from "@/components/MedLiveWatermark";

interface ProductCardProps {
  product: Product;
  showCardLogoBadge?: boolean;
}

export default function ProductCard({
  product,
  showCardLogoBadge = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const discount = getDiscountPercent(product);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const hoverImage = productHoverImageById[product.id];
  const showHoverImage = Boolean(hoverImage && hoverImage !== product.image);

  return (
    <Link
      href={`/products/${product.id}`}
      className="card card-hover group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        <div className="absolute inset-0">
          <div className="relative h-full w-full overflow-hidden">
            <ProductImage
              src={product.image}
              alt={product.name}
              productId={product.id}
              className="object-contain bg-white p-2 transition duration-300 group-hover:opacity-0"
            />
            {showCardLogoBadge && product.image.includes("/products/medlive/") && (
              <div className="absolute inset-2 overflow-hidden">
                <MedLiveWatermark variant="card" />
              </div>
            )}
          </div>
          {showHoverImage && hoverImage && (
            <div className="absolute inset-0">
              <div className="relative h-full w-full overflow-hidden">
                <ProductImage
                  src={hoverImage}
                  alt={product.name}
                  productId={product.id}
                  className="object-contain bg-white p-2 opacity-0 transition duration-300 group-hover:opacity-100"
                />
                {showCardLogoBadge && hoverImage.includes("/products/medlive/") && (
                  <div className="absolute inset-2 overflow-hidden">
                    <MedLiveWatermark variant="card" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {discount && (
          <span className="badge-sale absolute left-2 top-2 z-10">-{discount}%</span>
        )}
        {!product.inStock && (
          <span className="absolute right-2 top-2 z-10 rounded-lg bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
            Out of Stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.brand && (
          <span className="section-eyebrow mb-1 text-[10px]">{product.brand}</span>
        )}

        <h3 className="mb-1.5 line-clamp-2 text-[13px] font-semibold leading-snug text-slate-900 transition group-hover:text-primary-700">
          {product.name}
        </h3>

        <div className="mb-1.5 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-amber-800">{product.rating}</span>
          </div>
          <span className="text-xs text-slate-400">{product.reviews} reviews</span>
        </div>

        <div className="mb-1 flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {product.unit && <p className="mb-3 text-[11px] text-slate-500">{product.unit}</p>}

        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className={cn(
            "mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition",
            added
              ? "bg-primary-600 text-white"
              : "btn-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          )}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </Link>
  );
}
