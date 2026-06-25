/** Unique cart line key — separates nitrile 50 vs 100 pack on same product id. */
export function getCartLineId(productId: string, variantKey?: string): string {
  return variantKey ? `${productId}::${variantKey}` : productId;
}

export function parseCartLineId(lineId: string): { productId: string; variantKey?: string } {
  const [productId, variantKey] = lineId.split("::");
  return { productId, variantKey };
}

export function nitrilePackVariantKey(packSize: 50 | 100): string {
  return `pack-${packSize}`;
}
