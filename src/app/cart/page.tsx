"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { resolveCartLineUnitPrice } from "@/lib/cart-pricing";
import DeliveryPincodeBlock from "@/components/DeliveryPincodeBlock";
import PromoCodeInput from "@/components/PromoCodeInput";
import OrderSummaryLines from "@/components/OrderSummaryLines";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    totalItems,
    appliedPromo,
    applyPromo,
    removePromo,
    totals,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50 ring-1 ring-primary-100">
          <ShoppingBag className="h-10 w-10 text-primary-600" />
        </div>
        <h1 className="section-title">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">
          Browse our medical equipment catalog and add items to get started.
        </p>
        <Link href="/products" className="btn-primary mt-8 inline-flex px-6 py-3 text-sm">
          Shop Equipment
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-10 sm:py-12">
      <p className="section-eyebrow mb-2">Cart</p>
      <h1 className="section-title mb-8">
        Shopping Cart ({totalItems} item{totalItems !== 1 ? "s" : ""})
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ lineId, product, quantity, variantKey }) => {
            const unitPrice = resolveCartLineUnitPrice(
              product.id,
              variantKey,
              quantity,
              product.price
            );
            return (
            <div
              key={lineId}
              className="card flex gap-4 p-4 sm:gap-6 sm:p-6"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${product.id}`}
                      className="font-semibold text-slate-900 hover:text-primary-700"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {product.category}
                      {variantKey ? ` · ${variantKey.replace("pack-", "Box of ")}` : ""}
                      {product.unit ? ` · ${product.unit}` : ""}
                    </p>
                  </div>
                  <p className="font-bold text-slate-900">
                    {formatPrice(unitPrice * quantity)}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center rounded-lg border border-slate-200">
                    <button
                      onClick={() => updateQuantity(lineId, quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(lineId, quantity + 1)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(lineId)}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        <div className="card h-fit space-y-5 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>

          <DeliveryPincodeBlock />

          <PromoCodeInput
            appliedCode={appliedPromo?.code}
            appliedLabel={appliedPromo?.label}
            onApply={applyPromo}
            onRemove={removePromo}
          />

          <OrderSummaryLines totals={totals} promoLabel={appliedPromo?.code} />

          <Link
            href="/checkout"
            className="btn-primary mt-2 w-full py-3.5 text-sm"
          >
            Proceed to Checkout
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/products"
            className="block text-center text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
