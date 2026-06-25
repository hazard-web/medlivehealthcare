import { formatPrice } from "@/lib/products";
import { OrderTotals } from "@/lib/orderTotals";
import { SHIPPING_THRESHOLD } from "@/lib/config";

interface OrderSummaryLinesProps {
  totals: OrderTotals;
  promoLabel?: string | null;
}

export default function OrderSummaryLines({ totals, promoLabel }: OrderSummaryLinesProps) {
  const { subtotal, promoDiscount, discountedSubtotal, shipping, tax, total } = totals;

  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-slate-500">Subtotal</dt>
        <dd className="font-medium">{formatPrice(subtotal)}</dd>
      </div>
      {promoDiscount > 0 && (
        <div className="flex justify-between text-primary-700">
          <dt>
            Promo discount
            {promoLabel ? ` (${promoLabel})` : ""}
          </dt>
          <dd className="font-semibold">−{formatPrice(promoDiscount)}</dd>
        </div>
      )}
      {promoDiscount > 0 && (
        <div className="flex justify-between">
          <dt className="text-slate-500">After discount</dt>
          <dd className="font-medium">{formatPrice(discountedSubtotal)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-slate-500">Delivery</dt>
        <dd className="font-medium">
          {shipping === 0 ? (
            <span className="font-semibold text-primary-600">Free</span>
          ) : (
            formatPrice(shipping)
          )}
        </dd>
      </div>
      {discountedSubtotal > 0 && discountedSubtotal < SHIPPING_THRESHOLD && (
        <p className="text-xs text-primary-600">
          Add {formatPrice(SHIPPING_THRESHOLD - discountedSubtotal)} more for free delivery
        </p>
      )}
      <div className="flex justify-between">
        <dt className="text-slate-500">GST (12%)</dt>
        <dd className="font-medium">{formatPrice(tax)}</dd>
      </div>
      <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
        <dt className="font-semibold text-slate-900">Total</dt>
        <dd className="font-bold text-slate-900">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
