import { CartItem, Order, OrderStatus } from "@/lib/types";
import { getProductById } from "@/lib/products";
import { StoredOrder } from "./store";

export function serverOrderToClient(order: StoredOrder): Order {
  const items: CartItem[] = order.items.map((item) => {
    const catalog = getProductById(item.productId);
    return {
      lineId: item.lineId,
      variantKey: item.variantKey,
      quantity: item.quantity,
      product: {
        id: item.productId,
        name: item.name,
        description: catalog?.description ?? "",
        price: item.unitPrice,
        originalPrice: catalog?.originalPrice,
        category: catalog?.category ?? "Medical",
        brand: catalog?.brand,
        unit: catalog?.unit,
        image: item.image,
        rating: catalog?.rating ?? 4.5,
        reviews: catalog?.reviews ?? 0,
        inStock: true,
        features: catalog?.features ?? [],
      },
    };
  });

  return {
    id: order.id,
    userId: order.userId ?? "",
    items,
    total: order.total,
    status: order.status as OrderStatus,
    createdAt: order.createdAt,
    paymentId: order.paymentId ?? undefined,
    razorpayOrderId: order.razorpayOrderId ?? undefined,
    subtotal: order.subtotal,
    promoDiscount: order.promoDiscount,
    promoCode: order.promoCode ?? undefined,
    pincode: order.pincode,
    shippingAddress: order.shippingAddress,
    shippingName: order.shippingAddress.fullName,
    shippingPhone: order.shippingAddress.phone,
    orderNumber: order.orderNumber,
    invoiceNumber: order.invoiceNumber ?? undefined,
    paymentMethod: order.paymentMethod,
    gstin: order.gstin ?? undefined,
    cgst: order.cgst,
    sgst: order.sgst,
    igst: order.igst,
    shipment: order.shipment
      ? {
          awb: order.shipment.awb,
          courier: order.shipment.courier,
          trackingUrl: order.shipment.trackingUrl,
          estimatedDelivery: order.shipment.estimatedDelivery,
        }
      : undefined,
    returnRequest: order.returnRequest ?? undefined,
  };
}
