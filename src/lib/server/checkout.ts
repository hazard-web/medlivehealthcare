import { getProductById } from "@/lib/products";
import { validatePromoCode } from "@/lib/promo";
import { calculateOrderTotals } from "@/lib/orderTotals";
import { parseCartLineId } from "@/lib/cart-line";
import { getProductCompliance } from "@/lib/product-compliance";
import { resolveCatalogUnitPrice, validateLineUnitPrice, acceptableUnitPrices } from "@/lib/cart-pricing";
import { checkPincode } from "@/lib/pincode";
import { mutateStore, nextInvoiceNumber, nextOrderNumber, purgeExpired, StoredOrder, StoredOrderItem } from "./store";

export interface CartLineInput {
  lineId: string;
  productId: string;
  variantKey?: string;
  quantity: number;
  /** Client-reported unit price — server recalculates and must match within tolerance */
  unitPrice: number;
}

export interface ValidatedCheckout {
  items: StoredOrderItem[];
  subtotal: number;
  promoCode: string | null;
  promoDiscount: number;
  shipping: number;
  tax: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  token: string;
  expiresAt: string;
}

const MAHARASHTRA = "Maharashtra";

function splitGst(taxableAmount: number, shippingState: string, gstRate = 0.12) {
  const tax = Math.round(taxableAmount * gstRate * 100) / 100;
  const isMaharashtra = shippingState.trim().toLowerCase() === MAHARASHTRA.toLowerCase();
  if (isMaharashtra) {
    const half = Math.round((tax / 2) * 100) / 100;
    return { tax, cgst: half, sgst: half, igst: 0 };
  }
  return { tax, cgst: 0, sgst: 0, igst: tax };
}

export function validateCartLines(lines: CartLineInput[]): StoredOrderItem[] | { error: string } {
  if (!lines.length) return { error: "Your cart is empty." };

  const items: StoredOrderItem[] = [];

  for (const line of lines) {
    if (line.quantity < 1) return { error: "Invalid quantity in cart." };

    const parsed = parseCartLineId(line.lineId);
    const productId = line.productId || parsed.productId;
    const variantKey = line.variantKey || parsed.variantKey;

    const product = getProductById(productId);
    if (!product) return { error: `Product not found: ${productId}` };
    if (!product.inStock) return { error: `${product.name} is out of stock.` };

    const serverPrice = resolveCatalogUnitPrice(productId, variantKey);
    if (serverPrice === null) return { error: `Could not price ${product.name}.` };

    if (!validateLineUnitPrice(productId, variantKey, line.quantity, line.unitPrice)) {
      return { error: `Price changed for ${product.name}. Please refresh your cart.` };
    }

    const unitPrice =
      acceptableUnitPrices(productId, variantKey, line.quantity).find(
        (p) => Math.abs(p - line.unitPrice) <= 0.02
      ) ?? serverPrice;

    const compliance = getProductCompliance(productId);
    const lineTotal = Math.round(unitPrice * line.quantity * 100) / 100;

    let name = product.name;
    if (variantKey?.startsWith("pack-")) {
      const pack = variantKey.replace("pack-", "");
      name = `${product.name} — Box of ${pack}`;
    }

    items.push({
      lineId: line.lineId,
      productId,
      variantKey,
      name,
      quantity: line.quantity,
      unitPrice,
      lineTotal,
      image: product.image,
      hsn: compliance?.hsn,
      gstRate: compliance?.gstRate ?? 0.12,
    });
  }

  return items;
}

export async function createCheckoutToken(input: {
  lines: CartLineInput[];
  promoCode?: string;
  shippingState: string;
  gstin?: string | null;
  userId?: string | null;
  guestPhone?: string | null;
}): Promise<ValidatedCheckout | { error: string }> {
  const itemsResult = validateCartLines(input.lines);
  if ("error" in itemsResult) return itemsResult;

  const subtotal = itemsResult.reduce((sum, i) => sum + i.lineTotal, 0);
  let promoDiscount = 0;
  let promoCode: string | null = null;

  if (input.promoCode?.trim()) {
    const promo = validatePromoCode(input.promoCode, subtotal);
    if (!promo.success) return { error: promo.error };
    promoDiscount = promo.promo.discount;
    promoCode = promo.promo.code;
  }

  const totals = calculateOrderTotals(subtotal, promoDiscount);
  const gst = splitGst(totals.discountedSubtotal, input.shippingState);

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  await mutateStore((store) => {
    purgeExpired(store);
    store.checkoutTokens.push({
      token,
      userId: input.userId ?? null,
      guestPhone: input.guestPhone ?? null,
      items: itemsResult,
      subtotal: totals.subtotal,
      promoCode,
      promoDiscount: totals.promoDiscount,
      shipping: totals.shipping,
      tax: gst.tax,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      total: totals.total,
      gstin: input.gstin?.trim().toUpperCase() || null,
      shippingState: input.shippingState,
      expiresAt,
    });
  });

  return {
    items: itemsResult,
    subtotal: totals.subtotal,
    promoCode,
    promoDiscount: totals.promoDiscount,
    shipping: totals.shipping,
    tax: gst.tax,
    cgst: gst.cgst,
    sgst: gst.sgst,
    igst: gst.igst,
    total: totals.total,
    token,
    expiresAt,
  };
}

export async function consumeCheckoutToken(token: string) {
  return mutateStore((store) => {
    purgeExpired(store);
    const idx = store.checkoutTokens.findIndex((t) => t.token === token);
    if (idx === -1) return null;
    const [checkout] = store.checkoutTokens.splice(idx, 1);
    if (new Date(checkout.expiresAt).getTime() < Date.now()) return null;
    return checkout;
  });
}

export async function getCheckoutToken(token: string) {
  const store = await mutateStore((s) => s);
  purgeExpired(store);
  const checkout = store.checkoutTokens.find((t) => t.token === token);
  if (!checkout || new Date(checkout.expiresAt).getTime() < Date.now()) return null;
  return checkout;
}

export async function createOrderFromCheckout(input: {
  checkoutToken: string;
  paymentMethod: "razorpay" | "cod";
  shippingAddress: StoredOrder["shippingAddress"];
  userId?: string | null;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  paymentId?: string;
  razorpayOrderId?: string;
  pincode: string;
}): Promise<StoredOrder | { error: string }> {
  const pinCheck = checkPincode(input.pincode);
  if (!pinCheck.serviceable) {
    return { error: pinCheck.message };
  }

  const checkout = await consumeCheckoutToken(input.checkoutToken);
  if (!checkout) return { error: "Checkout session expired. Please try again." };

  const { createShipment } = await import("@/lib/logistics");

  return mutateStore((store) => {
    const orderNumber = nextOrderNumber(store);
    const invoiceNumber = nextInvoiceNumber(store);
    const shipment = createShipment(orderNumber, input.pincode, pinCheck.city ?? input.shippingAddress.city);

    const order: StoredOrder = {
      id: `ord_${crypto.randomUUID()}`,
      orderNumber,
      userId: input.userId ?? checkout.userId,
      guestPhone: input.guestPhone ?? checkout.guestPhone,
      guestEmail: input.guestEmail ?? null,
      guestName: input.guestName ?? null,
      items: checkout.items,
      subtotal: checkout.subtotal,
      promoCode: checkout.promoCode,
      promoDiscount: checkout.promoDiscount,
      shipping: checkout.shipping,
      tax: checkout.tax,
      cgst: checkout.cgst,
      sgst: checkout.sgst,
      igst: checkout.igst,
      total: checkout.total,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "cod" ? "pending" : "paid",
      paymentId: input.paymentId ?? null,
      razorpayOrderId: input.razorpayOrderId ?? null,
      status: input.paymentMethod === "cod" ? "pending" : "paid",
      shippingAddress: input.shippingAddress,
      gstin: checkout.gstin,
      invoiceNumber,
      pincode: input.pincode,
      shipment,
      returnRequest: null,
      createdAt: new Date().toISOString(),
    };

    store.orders.push(order);
    return order;
  });
}
