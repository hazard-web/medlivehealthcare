export const STANDARD_BULK_MIN = {
  tier10: 10,
  tier20: 20,
} as const;

export type StandardBulkTier = keyof typeof STANDARD_BULK_MIN;

export function standardBulkRate(tier: StandardBulkTier): number {
  return tier === "tier10" ? 0.03 : 0.05;
}

export function standardBulkDisplaySave(unitPrice: number, tier: StandardBulkTier): number {
  const qty = STANDARD_BULK_MIN[tier];
  return Math.round(unitPrice * qty * standardBulkRate(tier) * 100) / 100;
}

export function standardLineTotals(
  unitPrice: number,
  quantity: number,
  bulkTier: StandardBulkTier | null
): { subtotal: number; discount: number; total: number; rate: number } {
  const subtotal = Math.round(unitPrice * quantity * 100) / 100;
  let rate = 0;
  if (bulkTier === "tier20" && quantity >= STANDARD_BULK_MIN.tier20) {
    rate = standardBulkRate("tier20");
  } else if (bulkTier === "tier10" && quantity >= STANDARD_BULK_MIN.tier10) {
    rate = standardBulkRate("tier10");
  }
  const discount = Math.round(subtotal * rate * 100) / 100;
  return { subtotal, discount, total: subtotal - discount, rate };
}
