export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  unit?: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  features: string[];
}

export interface CartItem {
  lineId: string;
  product: Product;
  quantity: number;
  variantKey?: string;
  /** True when this line was added before sign-in and merged into the account cart. */
  fromGuestSession?: boolean;
}

export type AddressLabel = "Home" | "Work" | "Other";

export interface SavedAddress {
  id: string;
  label: AddressLabel;
  fullName: string;
  phone: string;
  flatHouse: string;
  building?: string;
  street: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  /** @deprecated Use savedAddresses */
  address?: string;
  city?: string;
  zip?: string;
  savedAddresses?: SavedAddress[];
}

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

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  paymentId?: string;
  razorpayOrderId?: string;
  subtotal?: number;
  promoDiscount?: number;
  promoCode?: string;
  pincode?: string;
  shippingAddress?: SavedAddress | null;
  shippingName?: string;
  shippingPhone?: string;
  address?: string;
  city?: string;
  returnRequest?: {
    id: string;
    productIds: string[];
    reason: string;
    comments?: string;
    refundMethod: "original_payment" | "cod_refund";
    status: "requested" | "approved" | "picked_up" | "refunded";
    createdAt: string;
    refundAmount: number;
  };
  orderNumber?: string;
  invoiceNumber?: string;
  paymentMethod?: "razorpay" | "cod";
  gstin?: string;
  cgst?: number;
  sgst?: number;
  igst?: number;
  shipment?: {
    awb: string;
    courier: string;
    trackingUrl: string;
    estimatedDelivery: string;
  };
}
