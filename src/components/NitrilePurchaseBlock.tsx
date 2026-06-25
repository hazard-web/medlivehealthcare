"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/cn";
import { getCartLineId, nitrilePackVariantKey } from "@/lib/cart-line";
import {
  nitrileBulkDisplaySave,
  nitrileLineTotals,
  nitrileUnitPrice,
  NitrileBulkTier,
  NITRILE_BULK_MIN_BOXES,
  NitrilePackSize,
  NITRILE_PACK_OPTIONS,
} from "@/lib/nitrile-pricing";

interface NitrilePurchaseBlockProps {
  product: Product;
  packSize: NitrilePackSize;
  onPackSizeChange: (packSize: NitrilePackSize) => void;
}

export default function NitrilePurchaseBlock({
  product,
  packSize,
  onPackSizeChange,
}: NitrilePurchaseBlockProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [bulkTier, setBulkTier] = useState<NitrileBulkTier | null>(null);
  const [added, setAdded] = useState(false);

  const unitPrice = nitrileUnitPrice(packSize);
  const { subtotal, discount, total } = nitrileLineTotals(packSize, quantity, bulkTier);

  const tier4Eligible = quantity >= NITRILE_BULK_MIN_BOXES.tier4;
  const tier8Eligible = quantity >= NITRILE_BULK_MIN_BOXES.tier8;
  const activeDiscountRate =
    bulkTier === "tier8" && tier8Eligible
      ? 0.08
      : bulkTier === "tier4" && tier4Eligible
        ? 0.04
        : 0;

  const buildCartProduct = (): Product => ({
    ...product,
    price: quantity > 0 ? Math.round(total / quantity) : unitPrice,
    unit: `per box of ${packSize} gloves`,
  });

  const handleAdd = (redirectToCheckout = false) => {
    addItem(buildCartProduct(), quantity, nitrilePackVariantKey(packSize));
    if (redirectToCheckout) {
      router.push("/checkout");
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const toggleBulkTier = (tier: NitrileBulkTier) => {
    if (bulkTier === tier) {
      setBulkTier(null);
      setQuantity(1);
      return;
    }
    setBulkTier(tier);
    setQuantity(NITRILE_BULK_MIN_BOXES[tier]);
  };

  const bulkOffers: {
    tier: NitrileBulkTier;
    save: number;
    label: string;
    minBoxes: number;
    eligible: boolean;
  }[] = [
    {
      tier: "tier4",
      save: nitrileBulkDisplaySave(packSize, "tier4"),
      label: "Buy 50+ packets & Get Extra 4% OFF",
      minBoxes: NITRILE_BULK_MIN_BOXES.tier4,
      eligible: tier4Eligible,
    },
    {
      tier: "tier8",
      save: nitrileBulkDisplaySave(packSize, "tier8"),
      label: "Buy 100+ packets & Get Extra 8% OFF",
      minBoxes: NITRILE_BULK_MIN_BOXES.tier8,
      eligible: tier8Eligible,
    },
  ];

  return (
    <div className="card mt-7 p-4 sm:p-5">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          Pack Size : {packSize} Gloves
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatPrice(unitPrice)} per box
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {NITRILE_PACK_OPTIONS.map((size) => {
            const selected = packSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onPackSizeChange(size)}
                className={cn(
                  "rounded-lg border px-4 py-2.5 text-sm font-semibold transition",
                  selected
                    ? "border-primary-600 bg-primary-600 text-white shadow-sm"
                    : "border-primary-200 bg-primary-50 text-primary-800 hover:border-primary-300 hover:bg-primary-100"
                )}
              >
                {size} Gloves
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-800">Quantity (packets)</p>
        <div className="mt-3 flex w-full items-center rounded-xl border border-border bg-white sm:max-w-xs">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-3 text-base font-semibold text-slate-600 transition hover:bg-surface-muted"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="flex-1 text-center text-sm font-semibold text-slate-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-3 text-base font-semibold text-slate-600 transition hover:bg-surface-muted"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {bulkOffers.map(({ tier, save, label, minBoxes, eligible }) => {
          const selected = bulkTier === tier;
          const pending = selected && !eligible;
          return (
            <label
              key={tier}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
                selected
                  ? "border-primary-200 bg-primary-50 ring-1 ring-primary-100"
                  : "border-border bg-white hover:border-primary-200"
              )}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleBulkTier(tier)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
              />
              <span className="min-w-0 flex-1">
                <span className="badge-sale">{`Save ${formatPrice(save)}`}</span>
                <span className="mt-2 block text-sm font-bold text-slate-900">{label}</span>
                {pending && (
                  <span className="mt-1 block text-xs text-primary-700">
                    Add {minBoxes - quantity} more packet{minBoxes - quantity === 1 ? "" : "s"} to apply
                  </span>
                )}
                {!selected && !eligible && (
                  <span className="mt-1 block text-xs text-slate-500">
                    Applies when you order {minBoxes}+ packets
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl bg-surface-muted px-4 py-3 text-sm">
        {discount > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-700">
              <span>Total amount</span>
              <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-primary-700">
              <span>Bulk discount ({Math.round(activeDiscountRate * 100)}%)</span>
              <span className="font-semibold">−{formatPrice(discount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="font-semibold text-slate-800">Discounted price</span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">Total Amount</span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              {formatPrice(subtotal)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={() => handleAdd(false)}
          disabled={!product.inStock}
          className="btn-secondary w-full py-3 text-sm disabled:opacity-50"
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleAdd(true)}
          disabled={!product.inStock}
          className="btn-primary w-full py-3 text-sm disabled:opacity-50"
        >
          Buy now
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs text-slate-600">
        {[
          { icon: Truck, label: "Free shipping" },
          { icon: ShieldCheck, label: "Secure checkout" },
          { icon: RotateCcw, label: "Easy returns" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-2 rounded-xl bg-surface-muted px-2 py-2"
          >
            <Icon className="h-4 w-4 text-primary-700" />
            <span className="font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
