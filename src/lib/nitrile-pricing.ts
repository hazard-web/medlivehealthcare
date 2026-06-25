export const NITRILE_PACK_OPTIONS = [50, 100] as const;
export type NitrilePackSize = (typeof NITRILE_PACK_OPTIONS)[number];

export const NITRILE_PACK_PRICES: Record<NitrilePackSize, number> = {
  50: 129,
  100: 249,
};

/** MRP scaled from 100-glove pack (₹1,905). */
export const NITRILE_PACK_ORIGINAL: Record<NitrilePackSize, number> = {
  50: 987,
  100: 1905,
};

export function nitrileUnitPrice(packSize: NitrilePackSize): number {
  return NITRILE_PACK_PRICES[packSize];
}

export function nitrileOriginalPrice(packSize: NitrilePackSize): number {
  return NITRILE_PACK_ORIGINAL[packSize];
}

export function nitrileDiscountPercent(packSize: NitrilePackSize): number | null {
  const price = nitrileUnitPrice(packSize);
  const original = nitrileOriginalPrice(packSize);
  if (original <= price) return null;
  return Math.round((1 - price / original) * 100);
}

export const NITRILE_BULK_MIN_BOXES = {
  tier4: 50,
  tier8: 100,
} as const;

export type NitrileBulkTier = keyof typeof NITRILE_BULK_MIN_BOXES;

export function nitrileBulkRate(tier: NitrileBulkTier): number {
  return tier === "tier4" ? 0.04 : 0.08;
}

/** Save badge amount at tier minimum packets for the selected glove pack. */
export function nitrileBulkDisplaySave(
  packSize: NitrilePackSize,
  tier: NitrileBulkTier
): number {
  const unit = nitrileUnitPrice(packSize);
  const boxes = NITRILE_BULK_MIN_BOXES[tier];
  return Math.round(unit * boxes * nitrileBulkRate(tier));
}

export function nitrileLineTotals(
  packSize: NitrilePackSize,
  quantity: number,
  bulkTier: NitrileBulkTier | null
): { subtotal: number; discount: number; total: number } {
  const unit = nitrileUnitPrice(packSize);
  const subtotal = unit * quantity;
  let rate = 0;
  if (bulkTier === "tier8" && quantity >= NITRILE_BULK_MIN_BOXES.tier8) {
    rate = nitrileBulkRate("tier8");
  } else if (bulkTier === "tier4" && quantity >= NITRILE_BULK_MIN_BOXES.tier4) {
    rate = nitrileBulkRate("tier4");
  }
  const discount = Math.round(subtotal * rate);
  return { subtotal, discount, total: subtotal - discount };
}
