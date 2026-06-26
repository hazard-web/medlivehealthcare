"use client";

import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { formatPrice } from "@/lib/products";
import {
  displayOrderStatus,
  displayOrderStatusTone,
  formatOrderDateShort,
  orderItemCount,
  StoredOrder,
} from "@/lib/orders";

interface OrderHistoryCardProps {
  order: StoredOrder;
}

export default function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const firstItem = order.items[0];
  const extraCount = order.items.length - 1;

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-white transition hover:border-primary-200 hover:shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/60 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div>
            <p className="text-xs text-slate-500">Order placed</p>
            <p className="font-medium text-slate-800">{formatOrderDateShort(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total</p>
            <p className="font-semibold text-slate-900">{formatPrice(order.total)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Order #</p>
            <p className="font-mono text-xs font-medium text-slate-800">
              {order.orderNumber ?? order.id}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/account/orders/${order.id}`}
            className="btn-secondary px-4 py-2 text-xs sm:text-sm"
          >
            View order details
          </Link>
          <Link
            href={`/account/orders/${order.id}#track`}
            className="btn-primary px-4 py-2 text-xs sm:text-sm"
          >
            Track package
          </Link>
        </div>
      </div>

      <Link
        href={`/account/orders/${order.id}`}
        className="flex items-center gap-4 px-4 py-4 sm:px-5"
      >
        {firstItem ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
            <ProductImage
              src={firstItem.product.image}
              alt={firstItem.product.name}
              productId={firstItem.product.id}
              sizes="64px"
              className="object-contain p-1"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
            <Package className="h-6 w-6 text-slate-400" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 font-medium text-slate-900">
            {firstItem?.product.name ?? "Order items"}
            {extraCount > 0 ? ` + ${extraCount} more` : ""}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            {orderItemCount(order.items)} item{orderItemCount(order.items) !== 1 ? "s" : ""}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${displayOrderStatusTone(order)}`}
          >
            {displayOrderStatus(order)}
          </span>
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
      </Link>
    </li>
  );
}
