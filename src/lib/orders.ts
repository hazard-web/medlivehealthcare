import { CartItem, Order, SavedAddress } from "@/lib/types";
import { formatSavedAddress } from "@/lib/addresses";
import { resolveOrderProductImage } from "@/lib/product-images";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "refunded";

export type ReturnReason =
  | "damaged"
  | "wrong_item"
  | "not_needed"
  | "quality_issue"
  | "other";

export interface ReturnRequest {
  id: string;
  productIds: string[];
  reason: ReturnReason;
  comments?: string;
  refundMethod: "original_payment";
  status: "requested" | "approved" | "picked_up" | "refunded";
  createdAt: string;
  refundAmount: number;
}

export interface StoredOrder extends Order {
  subtotal?: number;
  promoDiscount?: number;
  promoCode?: string;
  pincode?: string;
  shippingAddress?: SavedAddress | null;
  shippingName?: string;
  shippingPhone?: string;
  address?: string;
  city?: string;
  status: OrderStatus;
  returnRequest?: ReturnRequest;
}

export interface TrackingStep {
  id: string;
  label: string;
  detail: string;
  at?: string;
  done: boolean;
  current: boolean;
}

const RETURN_REASONS: Record<ReturnReason, string> = {
  damaged: "Item arrived damaged",
  wrong_item: "Wrong item received",
  not_needed: "No longer needed",
  quality_issue: "Quality not as expected",
  other: "Other reason",
};

export function returnReasonLabel(reason: ReturnReason): string {
  return RETURN_REASONS[reason];
}

export function isCodOrder(order: Pick<StoredOrder, "paymentMethod">): boolean {
  return order.paymentMethod === "cod";
}

export function paymentMethodLabel(order: Pick<StoredOrder, "paymentMethod">): string {
  return isCodOrder(order) ? "Cash on Delivery (COD)" : "Paid online (Razorpay)";
}

export function paymentStatusDetail(order: StoredOrder): string {
  if (!isCodOrder(order)) {
    return order.paymentId ? `Transaction ID: ${order.paymentId}` : "Payment received";
  }
  const status = resolveOrderStatus(order);
  if (status === "delivered") return "Cash payment collected on delivery";
  return "Pay when your order is delivered";
}

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatOrderDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysSince(iso: string): number {
  const created = new Date(iso).getTime();
  return Math.floor((Date.now() - created) / 86_400_000);
}

/** Demo progression: newer orders advance through shipping stages over time. */
export function resolveOrderStatus(order: StoredOrder): OrderStatus {
  if (order.returnRequest?.status === "refunded") return "refunded";
  if (order.returnRequest) return "return_requested";
  if (order.status === "cancelled") return "cancelled";

  const days = daysSince(order.createdAt);
  if (days >= 5) return "delivered";
  if (days >= 4) return "out_for_delivery";
  if (days >= 2) return "shipped";
  if (days >= 1) return "processing";
  return order.status === "paid" ? "paid" : "pending";
}

export function statusHeadline(
  status: OrderStatus,
  paymentMethod?: StoredOrder["paymentMethod"]
): string {
  if (paymentMethod === "cod") {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "out_for_delivery":
        return "Out for delivery";
      case "shipped":
        return "Shipped";
      case "processing":
        return "Preparing your order";
      case "return_requested":
        return "Return requested";
      case "refunded":
        return "Refund completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Order confirmed";
    }
  }

  switch (status) {
    case "delivered":
      return "Delivered";
    case "out_for_delivery":
      return "Out for delivery";
    case "shipped":
      return "Shipped";
    case "processing":
      return "Processing your order";
    case "paid":
      return "Payment confirmed";
    case "return_requested":
      return "Return requested";
    case "refunded":
      return "Refund completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Order placed";
  }
}

export function statusTone(status: OrderStatus): string {
  switch (status) {
    case "delivered":
    case "refunded":
      return "bg-emerald-50 text-emerald-800";
    case "out_for_delivery":
    case "shipped":
      return "bg-sky-50 text-sky-800";
    case "return_requested":
      return "bg-amber-50 text-amber-800";
    case "cancelled":
      return "bg-red-50 text-red-800";
    default:
      return "bg-primary-50 text-primary-800";
  }
}

export function estimatedDelivery(order: StoredOrder): string {
  if (order.shipment?.estimatedDelivery) {
    return new Date(order.shipment.estimatedDelivery).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }
  const created = new Date(order.createdAt);
  const eta = new Date(created);
  eta.setDate(eta.getDate() + 5);
  return eta.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function buildTrackingSteps(order: StoredOrder): TrackingStep[] {
  const status = resolveOrderStatus(order);
  const isCod = isCodOrder(order);
  const created = new Date(order.createdAt);

  const addDays = (n: number) => {
    const d = new Date(created);
    d.setDate(d.getDate() + n);
    return d.toISOString();
  };

  const razorpayRank: Record<OrderStatus, number> = {
    pending: 0,
    paid: 1,
    processing: 2,
    shipped: 3,
    out_for_delivery: 4,
    delivered: 5,
    return_requested: 5,
    refunded: 5,
    cancelled: -1,
  };

  const codRank: Record<OrderStatus, number> = {
    pending: 1,
    paid: 1,
    processing: 2,
    shipped: 3,
    out_for_delivery: 4,
    delivered: 5,
    return_requested: 5,
    refunded: 5,
    cancelled: -1,
  };

  const current = (isCod ? codRank : razorpayRank)[status];

  const steps: Omit<TrackingStep, "done" | "current">[] = [
    {
      id: "placed",
      label: "Order placed",
      detail: "We received your order",
      at: order.createdAt,
    },
    isCod
      ? {
          id: "confirmed",
          label: "Order confirmed",
          detail: "Cash on Delivery - pay when your package arrives",
          at: order.createdAt,
        }
      : {
          id: "paid",
          label: "Payment confirmed",
          detail: "Paid via Razorpay",
          at: addDays(0),
        },
    {
      id: "processing",
      label: "Processing",
      detail: "Packing your items at our warehouse",
      at: addDays(1),
    },
    {
      id: "shipped",
      label: "Shipped",
      detail: "Handed to courier partner",
      at: addDays(2),
    },
    {
      id: "out_for_delivery",
      label: "Out for delivery",
      detail: isCod
        ? "Courier is on the way - keep cash ready"
        : "Courier is on the way",
      at: addDays(4),
    },
    {
      id: "delivered",
      label: "Delivered",
      detail: isCod
        ? "Package delivered · Cash payment collected"
        : "Package delivered successfully",
      at: addDays(5),
    },
  ];

  return steps.map((step, i) => ({
    ...step,
    done: i <= current,
    current: i === current,
  }));
}

export function trackingId(order: StoredOrder): string {
  if (order.shipment?.awb) return order.shipment.awb;
  if (order.orderNumber) return order.orderNumber;
  return `ML${order.id.replace(/\D/g, "").slice(-10)}IN`;
}

export function canReturn(order: StoredOrder): boolean {
  const status = resolveOrderStatus(order);
  return (
    (status === "delivered" || status === "out_for_delivery" || status === "shipped") &&
    !order.returnRequest
  );
}

export function orderItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

function hasAddressContent(address?: SavedAddress | null): boolean {
  if (!address) return false;
  return Boolean(
    address.fullName?.trim() ||
      address.phone?.trim() ||
      address.flatHouse?.trim() ||
      address.building?.trim() ||
      address.street?.trim() ||
      address.area?.trim() ||
      address.city?.trim() ||
      address.state?.trim() ||
      address.pincode?.trim()
  );
}

/** Rebuild shipping from legacy fields for older orders. */
export function resolveOrderShippingAddress(order: StoredOrder): SavedAddress | null {
  if (hasAddressContent(order.shippingAddress)) {
    return order.shippingAddress!;
  }

  const legacyLine = order.address?.trim();
  const city = order.city?.trim();
  const pincode = order.pincode?.trim();
  const name = order.shippingName?.trim();
  const phone = order.shippingPhone?.trim();

  if (!legacyLine && !city && !pincode && !name && !phone) {
    return null;
  }

  return {
    id: `legacy-${order.id}`,
    label: "Home",
    fullName: name ?? "",
    phone: phone ?? "",
    flatHouse: legacyLine ?? "",
    street: "",
    area: "",
    city: city ?? "",
    state: "",
    pincode: pincode ?? "",
  };
}

export interface OrderShippingDisplay {
  name?: string;
  phone?: string;
  addressLine: string;
}

export function formatOrderShipping(order: StoredOrder): OrderShippingDisplay | null {
  const address = resolveOrderShippingAddress(order);
  if (!address) return null;

  const addressLine = formatSavedAddress(address);
  if (!addressLine && !address.fullName && !address.phone) return null;

  return {
    name: address.fullName || undefined,
    phone: address.phone || undefined,
    addressLine: addressLine || "Address on file",
  };
}

/** Use current catalog images — stored order snapshots can be stale. */
export function hydrateOrder(order: StoredOrder): StoredOrder {
  const shippingAddress = resolveOrderShippingAddress(order);

  return {
    ...order,
    shippingAddress,
    items: order.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        image: resolveOrderProductImage(item.product.id, item.product.image),
      },
    })),
  };
}
