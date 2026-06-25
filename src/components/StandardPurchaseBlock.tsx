"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, formatPriceDetailed } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/cn";
import {
  STANDARD_BULK_MIN,
  standardBulkDisplaySave,
  standardLineTotals,
  StandardBulkTier,
} from "@/lib/standard-bulk-pricing";

interface StandardPurchaseBlockProps {
  product: Product;
}

export default function StandardPurchaseBlock({ product }: StandardPurchaseBlockProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [bulkTier, setBulkTier] = useState<StandardBulkTier | null>(null);
  const [added, setAdded] = useState(false);

  const unitPrice = product.price;
  const { subtotal, discount, total, rate: activeDiscountRate } = standardLineTotals(
    unitPrice,
    quantity,
    bulkTier
  );

  const tier10Eligible = quantity >= STANDARD_BULK_MIN.tier10;
  const tier20Eligible = quantity >= STANDARD_BULK_MIN.tier20;

  const bulkOffers: {
    tier: StandardBulkTier;
    save: number;
    label: string;
    minQty: number;
    eligible: boolean;
  }[] = [
    {
      tier: "tier10",
      save: standardBulkDisplaySave(unitPrice, "tier10"),
      label: "Buy 10+ & Get Extra 3% OFF",
      minQty: STANDARD_BULK_MIN.tier10,
      eligible: tier10Eligible,
    },
    {
      tier: "tier20",
      save: standardBulkDisplaySave(unitPrice, "tier20"),
      label: "Buy 20+ & Get Extra 5% OFF",
      minQty: STANDARD_BULK_MIN.tier20,
      eligible: tier20Eligible,
    },
  ];

  const toggleBulkTier = (tier: StandardBulkTier) => {
    if (bulkTier === tier) {
      setBulkTier(null);
      setQuantity(1);
      return;
    }
    setBulkTier(tier);
    setQuantity(STANDARD_BULK_MIN[tier]);
  };

  const buildCartProduct = (): Product => ({
    ...product,
    price: quantity > 0 ? Math.round((total / quantity) * 100) / 100 : unitPrice,
  });

  const handleAdd = (redirectToCheckout = false) => {
    addItem(buildCartProduct(), quantity);
    if (redirectToCheckout) {
      router.push("/checkout");
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="card mt-7 p-4 sm:p-5">
      <p className="text-sm font-semibold text-slate-800">Quantity</p>
      <div className="mt-3 flex w-full items-center rounded-xl border border-border bg-white sm:max-w-xs">
        <button
          type="button"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-4 py-3 text-base font-semibold text-slate-600 hover:bg-surface-muted"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="flex-1 text-center text-sm font-semibold text-slate-900">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity(quantity + 1)}
          className="px-4 py-3 text-base font-semibold text-slate-600 hover:bg-surface-muted"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {bulkOffers.map(({ tier, save, label, minQty, eligible }) => {
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
                <span className="badge-sale">{`Save ${formatPriceDetailed(save)}`}</span>
                <span className="mt-2 block text-sm font-bold text-slate-900">{label}</span>
                {pending && (
                  <span className="mt-1 block text-xs text-primary-700">
                    Add {minQty - quantity} more to apply
                  </span>
                )}
                {!selected && !eligible && (
                  <span className="mt-1 block text-xs text-slate-500">
                    Applies when you order {minQty}+ items
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
              <span className="font-semibold">−{formatPriceDetailed(discount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="font-semibold text-slate-800">Discounted price</span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                {formatPriceDetailed(total)}
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
