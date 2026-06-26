import { getProductById } from "@/lib/products";
import { validatePromoCode } from "@/lib/promo";
import { calculateOrderTotals } from "@/lib/orderTotals";
import { parseCartLineId } from "@/lib/cart-line";
import { getProductCompliance } from "@/lib/product-compliance";
import { resolveCatalogUnitPrice, validateLineUnitPrice, acceptableUnitPrices } from "@/lib/cart-pricing";
import { checkPincode } from "@/lib/pincode";
import { isDatabaseConfigured } from "./db";
import {
  dbConsumeCheckoutToken,
  dbGetCheckoutToken,
  dbInsertCheckoutToken,
  dbInsertOrder,
  dbFindOrderByIdOrNumber,
  dbNextOrderAndInvoiceNumbers,
  dbUpdateOrderPayment,
} from "./supabase-store";
import { mutateStore, nextInvoiceNumber, nextOrderNumber, purgeExpired, StoredOrder, StoredOrderItem, CheckoutToken } from "./store";
import { verifyRazorpaySignature } from "@/lib/razorpay";

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

  const checkoutToken = {
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
  };

  if (isDatabaseConfigured()) {
    await dbInsertCheckoutToken(checkoutToken);
  } else {
    await mutateStore((store) => {
      purgeExpired(store);
      store.checkoutTokens.push(checkoutToken);
    });
  }

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
  if (isDatabaseConfigured()) {
    return dbConsumeCheckoutToken(token);
  }

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
  if (isDatabaseConfigured()) {
    return dbGetCheckoutToken(token);
  }

  const store = await mutateStore((s) => s);
  purgeExpired(store);
  const checkout = store.checkoutTokens.find((t) => t.token === token);
  if (!checkout || new Date(checkout.expiresAt).getTime() < Date.now()) return null;
  return checkout;
}

async function findOrderById(orderId: string): Promise<StoredOrder | null> {
  if (isDatabaseConfigured()) {
    return dbFindOrderByIdOrNumber(orderId);
  }
  const store = await mutateStore((s) => s);
  return store.orders.find((o) => o.id === orderId || o.orderNumber === orderId) ?? null;
}

async function persistOrder(order: StoredOrder): Promise<void> {
  if (isDatabaseConfigured()) {
    await dbInsertOrder(order);
    return;
  }
  await mutateStore((store) => {
    store.orders.push(order);
  });
}

async function saveOrderPayment(order: StoredOrder): Promise<void> {
  if (isDatabaseConfigured()) {
    await dbUpdateOrderPayment(order);
    return;
  }
  await mutateStore((store) => {
    const idx = store.orders.findIndex((o) => o.id === order.id);
    if (idx !== -1) store.orders[idx] = order;
  });
}

async function buildReservedOrder(
  checkout: CheckoutToken,
  input: {
    paymentMethod: "razorpay" | "cod";
    shippingAddress: StoredOrder["shippingAddress"];
    userId: string;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
    pincode: string;
  }
): Promise<StoredOrder> {
  const pinCheck = checkPincode(input.pincode);
  if (!pinCheck.serviceable) {
    throw new Error(pinCheck.message);
  }

  const { createShipment } = await import("@/lib/logistics");

  if (isDatabaseConfigured()) {
    const { orderNumber, invoiceNumber } = await dbNextOrderAndInvoiceNumbers();
    const shipment = createShipment(
      orderNumber,
      input.pincode,
      pinCheck.city ?? input.shippingAddress.city
    );

    return {
      id: `ord_${crypto.randomUUID()}`,
      orderNumber,
      userId: input.userId,
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
      paymentStatus: "pending",
      paymentId: null,
      razorpayOrderId: null,
      status: "pending",
      shippingAddress: input.shippingAddress,
      gstin: checkout.gstin,
      invoiceNumber,
      pincode: input.pincode,
      shipment,
      returnRequest: null,
      createdAt: new Date().toISOString(),
    };
  }

  return mutateStore((store) => {
    const orderNumber = nextOrderNumber(store);
    const invoiceNumber = nextInvoiceNumber(store);
    const shipment = createShipment(
      orderNumber,
      input.pincode,
      pinCheck.city ?? input.shippingAddress.city
    );

    const order: StoredOrder = {
      id: `ord_${crypto.randomUUID()}`,
      orderNumber,
      userId: input.userId,
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
      paymentStatus: "pending",
      paymentId: null,
      razorpayOrderId: null,
      status: "pending",
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

/** Create a pending order in history before payment is attempted. */
export async function reserveOrderFromCheckout(input: {
  checkoutToken: string;
  paymentMethod: "razorpay" | "cod";
  shippingAddress: StoredOrder["shippingAddress"];
  userId: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  pincode: string;
}): Promise<StoredOrder | { error: string }> {
  const checkout = await consumeCheckoutToken(input.checkoutToken);
  if (!checkout) return { error: "Checkout session expired. Please try again." };

  try {
    const order = await buildReservedOrder(checkout, input);
    if (isDatabaseConfigured()) {
      await persistOrder(order);
    }
    return order;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not reserve order." };
  }
}

export async function completeOrderPayment(input: {
  orderId: string;
  userId: string;
  paymentMethod: "razorpay" | "cod";
  paymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}): Promise<StoredOrder | { error: string }> {
  const order = await findOrderById(input.orderId);
  if (!order || order.userId !== input.userId) {
    return { error: "Order not found." };
  }

  if (order.paymentStatus === "paid") {
    return order;
  }

  if (order.paymentStatus === "failed") {
    return { error: "This order failed payment. Please place a new order." };
  }

  if (input.paymentMethod === "razorpay") {
    const { paymentId, razorpayOrderId, razorpaySignature } = input;
    if (!paymentId || !razorpayOrderId || !razorpaySignature) {
      return { error: "Payment verification is required." };
    }
    if (!verifyRazorpaySignature(razorpayOrderId, paymentId, razorpaySignature)) {
      return { error: "Invalid payment signature." };
    }
    order.paymentId = paymentId;
    order.razorpayOrderId = razorpayOrderId;
    order.paymentStatus = "paid";
    order.status = "paid";
  } else {
    order.paymentMethod = "cod";
    order.paymentStatus = "pending";
    order.status = "pending";
  }

  await saveOrderPayment(order);
  return order;
}

export async function failOrderPayment(input: {
  orderId: string;
  userId: string;
  reason?: string;
}): Promise<StoredOrder | { error: string }> {
  const order = await findOrderById(input.orderId);
  if (!order || order.userId !== input.userId) {
    return { error: "Order not found." };
  }

  if (order.paymentStatus === "paid") {
    return order;
  }

  order.paymentStatus = "failed";
  order.status = "cancelled";
  await saveOrderPayment(order);
  return order;
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

  if (isDatabaseConfigured()) {
    const { orderNumber, invoiceNumber } = await dbNextOrderAndInvoiceNumbers();
    const shipment = createShipment(
      orderNumber,
      input.pincode,
      pinCheck.city ?? input.shippingAddress.city
    );

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

    await dbInsertOrder(order);
    return order;
  }

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
