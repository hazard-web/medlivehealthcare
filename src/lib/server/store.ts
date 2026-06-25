import { promises as fs } from "fs";
import path from "path";
import { SavedAddress } from "@/lib/types";
import { isSupabaseConfigured } from "./supabase";
import { persistStoreToSupabase, readStoreFromSupabase } from "./supabase-store";

export interface StoredUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  isGuest: boolean;
  gstin: string | null;
  savedAddresses: SavedAddress[];
  createdAt: string;
}

export interface StoredSession {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface StoredOrderItem {
  lineId: string;
  productId: string;
  variantKey?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image: string;
  hsn?: string;
  gstRate?: number;
}

export interface StoredReturnRequest {
  id: string;
  productIds: string[];
  reason: string;
  comments?: string;
  refundMethod: "original_payment" | "cod_refund";
  status: "requested" | "approved" | "picked_up" | "refunded";
  createdAt: string;
  refundAmount: number;
}

export interface StoredShipment {
  awb: string;
  courier: string;
  trackingUrl: string;
  estimatedDelivery: string;
  status: "label_created" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered";
  events: { at: string; status: string; location: string }[];
}

export interface StoredOrder {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  guestName: string | null;
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
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentId: string | null;
  razorpayOrderId: string | null;
  status: string;
  shippingAddress: SavedAddress;
  gstin: string | null;
  invoiceNumber: string | null;
  pincode: string;
  shipment: StoredShipment | null;
  returnRequest: StoredReturnRequest | null;
  createdAt: string;
}

export interface CheckoutToken {
  token: string;
  userId: string | null;
  guestPhone: string | null;
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
  gstin: string | null;
  shippingState: string;
  expiresAt: string;
}

export interface OtpRecord {
  phone: string;
  code: string;
  expiresAt: string;
}

export interface PasswordResetToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: string;
}

export interface MedLiveStore {
  users: StoredUser[];
  sessions: StoredSession[];
  orders: StoredOrder[];
  checkoutTokens: CheckoutToken[];
  otpCodes: OtpRecord[];
  passwordResetTokens: PasswordResetToken[];
  invoiceCounter: number;
  orderCounter: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "medlive.json");

const DEFAULT_STORE: MedLiveStore = {
  users: [],
  sessions: [],
  orders: [],
  checkoutTokens: [],
  otpCodes: [],
  passwordResetTokens: [],
  invoiceCounter: 1000,
  orderCounter: 10000,
};

let writeQueue: Promise<void> = Promise.resolve();

function queueWrite(task: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(task).catch(() => task());
  return writeQueue;
}

export async function readStore(): Promise<MedLiveStore> {
  if (isSupabaseConfigured()) {
    return readStoreFromSupabase();
  }
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return { ...DEFAULT_STORE, ...JSON.parse(raw) } as MedLiveStore;
  } catch {
    return { ...DEFAULT_STORE };
  }
}

async function writeStoreLocal(store: MedLiveStore): Promise<void> {
  if (isSupabaseConfigured()) {
    await persistStoreToSupabase(store);
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function writeStore(store: MedLiveStore): Promise<void> {
  await writeStoreLocal(store);
}

export async function mutateStore<T>(
  mutator: (store: MedLiveStore) => T | Promise<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    queueWrite(async () => {
      try {
        const store = await readStore();
        const result = await mutator(store);
        await writeStore(store);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  });
}

export function nextOrderNumber(store: MedLiveStore): string {
  store.orderCounter += 1;
  return `ML${store.orderCounter}`;
}

export function nextInvoiceNumber(store: MedLiveStore): string {
  store.invoiceCounter += 1;
  const fy = new Date().getFullYear().toString().slice(-2);
  return `INV${fy}${String(store.invoiceCounter).padStart(5, "0")}`;
}

export function purgeExpired(store: MedLiveStore): void {
  const now = Date.now();
  store.sessions = store.sessions.filter((s) => new Date(s.expiresAt).getTime() > now);
  store.checkoutTokens = store.checkoutTokens.filter(
    (t) => new Date(t.expiresAt).getTime() > now
  );
  store.otpCodes = store.otpCodes.filter((o) => new Date(o.expiresAt).getTime() > now);
  if (store.passwordResetTokens) {
    store.passwordResetTokens = store.passwordResetTokens.filter(
      (t) => new Date(t.expiresAt).getTime() > now
    );
  } else {
    store.passwordResetTokens = [];
  }
}
