export interface PromoOffer {
  code: string;
  label: string;
  description: string;
}

export interface AppliedPromo {
  code: string;
  label: string;
  discount: number;
}

interface PromoRule {
  code: string;
  label: string;
  description: string;
  minSubtotal?: number;
  percentOff?: number;
  maxDiscount?: number;
  flatOff?: number;
}

const PROMO_RULES: PromoRule[] = [
  {
    code: "MEDLIVE10",
    label: "10% off",
    description: "10% off your order",
    percentOff: 10,
    maxDiscount: 500,
  },
  {
    code: "WELCOME50",
    label: "₹50 off",
    description: "₹50 off on orders ₹299+",
    flatOff: 50,
    minSubtotal: 299,
  },
  {
    code: "HEALTH15",
    label: "15% off",
    description: "15% off home care essentials (max ₹200)",
    percentOff: 15,
    maxDiscount: 200,
  },
];

export const PROMO_OFFERS: PromoOffer[] = PROMO_RULES.map(
  ({ code, label, description }) => ({ code, label, description })
);

export function validatePromoCode(
  code: string,
  subtotal: number
): { success: true; promo: AppliedPromo } | { success: false; error: string } {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { success: false, error: "Enter a promo code" };
  }

  const rule = PROMO_RULES.find((p) => p.code === normalized);
  if (!rule) {
    return { success: false, error: "Invalid promo code" };
  }

  if (rule.minSubtotal && subtotal < rule.minSubtotal) {
    return {
      success: false,
      error: `Minimum order ₹${rule.minSubtotal} required for this code`,
    };
  }

  let discount = 0;
  if (rule.percentOff) {
    discount = Math.round((subtotal * rule.percentOff) / 100);
    if (rule.maxDiscount) {
      discount = Math.min(discount, rule.maxDiscount);
    }
  } else if (rule.flatOff) {
    discount = rule.flatOff;
  }

  discount = Math.min(discount, subtotal);
  if (discount <= 0) {
    return { success: false, error: "This promo cannot be applied to your cart" };
  }

  return {
    success: true,
    promo: { code: rule.code, label: rule.label, discount },
  };
}
