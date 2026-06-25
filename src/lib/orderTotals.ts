import { GST_RATE, SHIPPING_COST, SHIPPING_THRESHOLD } from "./config";

export interface OrderTotals {
  subtotal: number;
  promoDiscount: number;
  discountedSubtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export function calculateOrderTotals(
  subtotal: number,
  promoDiscount = 0
): OrderTotals {
  const discountedSubtotal = Math.max(0, subtotal - promoDiscount);
  const shipping =
    discountedSubtotal >= SHIPPING_THRESHOLD || discountedSubtotal === 0
      ? 0
      : SHIPPING_COST;
  const tax = Math.round(discountedSubtotal * GST_RATE);
  const total = discountedSubtotal + shipping + tax;

  return {
    subtotal,
    promoDiscount,
    discountedSubtotal,
    shipping,
    tax,
    total,
  };
}
