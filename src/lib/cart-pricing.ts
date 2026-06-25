import { getProductById } from "./products";
import {
  nitrileLineTotals,
  nitrileUnitPrice,
  NitrilePackSize,
  NITRILE_BULK_MIN_BOXES,
  NitrileBulkTier,
} from "./nitrile-pricing";
import {
  standardLineTotals,
  STANDARD_BULK_MIN,
  StandardBulkTier,
} from "./standard-bulk-pricing";

const PRICE_TOLERANCE = 0.02;

/** Base catalog unit price — mirrors server checkout pricing. */
export function resolveCatalogUnitPrice(
  productId: string,
  variantKey?: string
): number | null {
  const product = getProductById(productId);
  if (!product) return null;

  if (productId.startsWith("nitrile-gloves-") && variantKey?.startsWith("pack-")) {
    const pack = Number(variantKey.replace("pack-", "")) as NitrilePackSize;
    if (pack === 50 || pack === 100) return nitrileUnitPrice(pack);
  }

  return product.price;
}

function effectiveUnit(total: number, quantity: number): number {
  return Math.round((total / quantity) * 100) / 100;
}

/** All unit prices valid for a line at this quantity (base + bulk tiers). */
export function acceptableUnitPrices(
  productId: string,
  variantKey: string | undefined,
  quantity: number
): number[] {
  const catalog = resolveCatalogUnitPrice(productId, variantKey);
  if (catalog === null) return [];

  const prices = new Set<number>([catalog]);

  if (productId.startsWith("nitrile-gloves-") && variantKey?.startsWith("pack-")) {
    const pack = Number(variantKey.replace("pack-", "")) as NitrilePackSize;
    if (pack === 50 || pack === 100) {
      (["tier4", "tier8"] as NitrileBulkTier[]).forEach((tier) => {
        if (quantity >= NITRILE_BULK_MIN_BOXES[tier]) {
          prices.add(effectiveUnit(nitrileLineTotals(pack, quantity, tier).total, quantity));
        }
      });
    }
    return [...prices];
  }

  (["tier10", "tier20"] as StandardBulkTier[]).forEach((tier) => {
    if (quantity >= STANDARD_BULK_MIN[tier]) {
      prices.add(effectiveUnit(standardLineTotals(catalog, quantity, tier).total, quantity));
    }
  });

  return [...prices];
}

export function validateLineUnitPrice(
  productId: string,
  variantKey: string | undefined,
  quantity: number,
  clientUnitPrice: number
): boolean {
  return acceptableUnitPrices(productId, variantKey, quantity).some(
    (p) => Math.abs(p - clientUnitPrice) <= PRICE_TOLERANCE
  );
}

/** Resolve the unit price to use for display, totals, and checkout. */
export function resolveCartLineUnitPrice(
  productId: string,
  variantKey: string | undefined,
  quantity: number,
  storedUnitPrice?: number
): number {
  const catalog = resolveCatalogUnitPrice(productId, variantKey);
  if (catalog === null) return storedUnitPrice ?? 0;

  if (
    storedUnitPrice !== undefined &&
    validateLineUnitPrice(productId, variantKey, quantity, storedUnitPrice)
  ) {
    return storedUnitPrice;
  }

  return catalog;
}
