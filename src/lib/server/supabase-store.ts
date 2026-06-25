import { SavedAddress } from "@/lib/types";
import { getSql } from "./db";
import type {
  CheckoutToken,
  MedLiveStore,
  OtpRecord,
  PasswordResetToken,
  StoredOrder,
  StoredSession,
  StoredUser,
} from "./store";

type UserRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  is_guest: boolean;
  gstin: string | null;
  saved_addresses: SavedAddress[];
  created_at: string;
};

type SessionRow = {
  token: string;
  user_id: string;
  expires_at: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  guest_name: string | null;
  items: StoredOrder["items"];
  subtotal: number;
  promo_code: string | null;
  promo_discount: number;
  shipping: number;
  tax: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  payment_method: string;
  payment_status: string;
  payment_id: string | null;
  razorpay_order_id: string | null;
  status: string;
  shipping_address: SavedAddress;
  gstin: string | null;
  invoice_number: string | null;
  pincode: string;
  shipment: StoredOrder["shipment"];
  return_request: StoredOrder["returnRequest"];
  created_at: string;
};

type CheckoutRow = {
  token: string;
  user_id: string | null;
  guest_phone: string | null;
  items: CheckoutToken["items"];
  subtotal: number;
  promo_code: string | null;
  promo_discount: number;
  shipping: number;
  tax: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  gstin: string | null;
  shipping_state: string;
  expires_at: string;
};

type OtpRow = {
  phone: string;
  code: string;
  expires_at: string;
};

type PasswordResetRow = {
  token: string;
  user_id: string;
  email: string;
  expires_at: string;
};

type CounterRow = {
  invoice_counter: number;
  order_counter: number;
};

function userToRow(u: StoredUser): UserRow {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    password_hash: u.passwordHash,
    is_guest: u.isGuest,
    gstin: u.gstin,
    saved_addresses: u.savedAddresses ?? [],
    created_at: u.createdAt,
  };
}

function rowToUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    isGuest: row.is_guest,
    gstin: row.gstin,
    savedAddresses: row.saved_addresses ?? [],
    createdAt: row.created_at,
  };
}

function sessionToRow(s: StoredSession): SessionRow {
  return { token: s.token, user_id: s.userId, expires_at: s.expiresAt };
}

function rowToSession(row: SessionRow): StoredSession {
  return { token: row.token, userId: row.user_id, expiresAt: row.expires_at };
}

function orderToRow(o: StoredOrder): OrderRow {
  return {
    id: o.id,
    order_number: o.orderNumber,
    user_id: o.userId,
    guest_phone: o.guestPhone,
    guest_email: o.guestEmail,
    guest_name: o.guestName,
    items: o.items,
    subtotal: o.subtotal,
    promo_code: o.promoCode,
    promo_discount: o.promoDiscount,
    shipping: o.shipping,
    tax: o.tax,
    cgst: o.cgst,
    sgst: o.sgst,
    igst: o.igst,
    total: o.total,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    payment_id: o.paymentId,
    razorpay_order_id: o.razorpayOrderId,
    status: o.status,
    shipping_address: o.shippingAddress,
    gstin: o.gstin,
    invoice_number: o.invoiceNumber,
    pincode: o.pincode,
    shipment: o.shipment,
    return_request: o.returnRequest,
    created_at: o.createdAt,
  };
}

function rowToOrder(row: OrderRow): StoredOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    guestPhone: row.guest_phone,
    guestEmail: row.guest_email,
    guestName: row.guest_name,
    items: row.items,
    subtotal: Number(row.subtotal),
    promoCode: row.promo_code,
    promoDiscount: Number(row.promo_discount),
    shipping: Number(row.shipping),
    tax: Number(row.tax),
    cgst: Number(row.cgst),
    sgst: Number(row.sgst),
    igst: Number(row.igst),
    total: Number(row.total),
    paymentMethod: row.payment_method as StoredOrder["paymentMethod"],
    paymentStatus: row.payment_status as StoredOrder["paymentStatus"],
    paymentId: row.payment_id,
    razorpayOrderId: row.razorpay_order_id,
    status: row.status,
    shippingAddress: row.shipping_address,
    gstin: row.gstin,
    invoiceNumber: row.invoice_number,
    pincode: row.pincode,
    shipment: row.shipment,
    returnRequest: row.return_request,
    createdAt: row.created_at,
  };
}

function checkoutToRow(t: CheckoutToken): CheckoutRow {
  return {
    token: t.token,
    user_id: t.userId,
    guest_phone: t.guestPhone,
    items: t.items,
    subtotal: t.subtotal,
    promo_code: t.promoCode,
    promo_discount: t.promoDiscount,
    shipping: t.shipping,
    tax: t.tax,
    cgst: t.cgst,
    sgst: t.sgst,
    igst: t.igst,
    total: t.total,
    gstin: t.gstin,
    shipping_state: t.shippingState,
    expires_at: t.expiresAt,
  };
}

function rowToCheckout(row: CheckoutRow): CheckoutToken {
  return {
    token: row.token,
    userId: row.user_id,
    guestPhone: row.guest_phone,
    items: row.items,
    subtotal: Number(row.subtotal),
    promoCode: row.promo_code,
    promoDiscount: Number(row.promo_discount),
    shipping: Number(row.shipping),
    tax: Number(row.tax),
    cgst: Number(row.cgst),
    sgst: Number(row.sgst),
    igst: Number(row.igst),
    total: Number(row.total),
    gstin: row.gstin,
    shippingState: row.shipping_state,
    expiresAt: row.expires_at,
  };
}

function otpToRow(o: OtpRecord): OtpRow {
  return { phone: o.phone, code: o.code, expires_at: o.expiresAt };
}

function rowToOtp(row: OtpRow): OtpRecord {
  return { phone: row.phone, code: row.code, expiresAt: row.expires_at };
}

function resetToRow(t: PasswordResetToken): PasswordResetRow {
  return {
    token: t.token,
    user_id: t.userId,
    email: t.email,
    expires_at: t.expiresAt,
  };
}

function rowToReset(row: PasswordResetRow): PasswordResetToken {
  return {
    token: row.token,
    userId: row.user_id,
    email: row.email,
    expiresAt: row.expires_at,
  };
}

export async function readStoreFromSupabase(): Promise<MedLiveStore> {
  const sql = getSql();
  const now = new Date().toISOString();

  await Promise.all([
    sql`delete from sessions where expires_at < ${now}::timestamptz`,
    sql`delete from checkout_tokens where expires_at < ${now}::timestamptz`,
    sql`delete from otp_codes where expires_at < ${now}::timestamptz`,
    sql`delete from password_reset_tokens where expires_at < ${now}::timestamptz`,
  ]);

  const [users, sessions, orders, checkoutTokens, otpCodes, passwordResetTokens, counters] =
    await Promise.all([
      sql<UserRow[]>`select * from users`,
      sql<SessionRow[]>`select * from sessions`,
      sql<OrderRow[]>`select * from orders`,
      sql<CheckoutRow[]>`select * from checkout_tokens`,
      sql<OtpRow[]>`select * from otp_codes`,
      sql<PasswordResetRow[]>`select * from password_reset_tokens`,
      sql<CounterRow[]>`select invoice_counter, order_counter from app_counters where id = 1`,
    ]);

  const counterRow = counters[0] ?? { invoice_counter: 1000, order_counter: 10000 };

  return {
    users: users.map(rowToUser),
    sessions: sessions.map(rowToSession),
    orders: orders.map(rowToOrder),
    checkoutTokens: checkoutTokens.map(rowToCheckout),
    otpCodes: otpCodes.map(rowToOtp),
    passwordResetTokens: passwordResetTokens.map(rowToReset),
    invoiceCounter: counterRow.invoice_counter,
    orderCounter: counterRow.order_counter,
  };
}

export async function persistStoreToSupabase(store: MedLiveStore): Promise<void> {
  const sql = getSql();

  if (store.users.length) {
    const rows = store.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      password_hash: u.passwordHash,
      is_guest: u.isGuest,
      gstin: u.gstin,
      saved_addresses: sql.json((u.savedAddresses ?? []) as never),
      created_at: u.createdAt,
    }));
    await sql`
      insert into users ${sql(rows)}
      on conflict (id) do update set
        name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        password_hash = excluded.password_hash,
        is_guest = excluded.is_guest,
        gstin = excluded.gstin,
        saved_addresses = excluded.saved_addresses
    `;
  }

  if (store.orders.length) {
    const rows = store.orders.map((o) => ({
      id: o.id,
      order_number: o.orderNumber,
      user_id: o.userId,
      guest_phone: o.guestPhone,
      guest_email: o.guestEmail,
      guest_name: o.guestName,
      items: sql.json(o.items as never),
      subtotal: o.subtotal,
      promo_code: o.promoCode,
      promo_discount: o.promoDiscount,
      shipping: o.shipping,
      tax: o.tax,
      cgst: o.cgst,
      sgst: o.sgst,
      igst: o.igst,
      total: o.total,
      payment_method: o.paymentMethod,
      payment_status: o.paymentStatus,
      payment_id: o.paymentId,
      razorpay_order_id: o.razorpayOrderId,
      status: o.status,
      shipping_address: sql.json(o.shippingAddress as never),
      gstin: o.gstin,
      invoice_number: o.invoiceNumber,
      pincode: o.pincode,
      shipment: sql.json(o.shipment as never),
      return_request: sql.json(o.returnRequest as never),
      created_at: o.createdAt,
    }));
    await sql`
      insert into orders ${sql(rows)}
      on conflict (id) do update set
        order_number = excluded.order_number,
        user_id = excluded.user_id,
        guest_phone = excluded.guest_phone,
        guest_email = excluded.guest_email,
        guest_name = excluded.guest_name,
        items = excluded.items,
        subtotal = excluded.subtotal,
        promo_code = excluded.promo_code,
        promo_discount = excluded.promo_discount,
        shipping = excluded.shipping,
        tax = excluded.tax,
        cgst = excluded.cgst,
        sgst = excluded.sgst,
        igst = excluded.igst,
        total = excluded.total,
        payment_method = excluded.payment_method,
        payment_status = excluded.payment_status,
        payment_id = excluded.payment_id,
        razorpay_order_id = excluded.razorpay_order_id,
        status = excluded.status,
        shipping_address = excluded.shipping_address,
        gstin = excluded.gstin,
        invoice_number = excluded.invoice_number,
        pincode = excluded.pincode,
        shipment = excluded.shipment,
        return_request = excluded.return_request
    `;
  }

  await sql`delete from sessions`;
  if (store.sessions.length) {
    await sql`insert into sessions ${sql(store.sessions.map(sessionToRow))}`;
  }

  await sql`delete from checkout_tokens`;
  if (store.checkoutTokens.length) {
    const rows = store.checkoutTokens.map((t) => ({
      token: t.token,
      user_id: t.userId,
      guest_phone: t.guestPhone,
      items: sql.json(t.items as never),
      subtotal: t.subtotal,
      promo_code: t.promoCode,
      promo_discount: t.promoDiscount,
      shipping: t.shipping,
      tax: t.tax,
      cgst: t.cgst,
      sgst: t.sgst,
      igst: t.igst,
      total: t.total,
      gstin: t.gstin,
      shipping_state: t.shippingState,
      expires_at: t.expiresAt,
    }));
    await sql`insert into checkout_tokens ${sql(rows)}`;
  }

  await sql`delete from otp_codes`;
  if (store.otpCodes.length) {
    await sql`insert into otp_codes ${sql(store.otpCodes.map(otpToRow))}`;
  }

  await sql`delete from password_reset_tokens`;
  if (store.passwordResetTokens.length) {
    await sql`insert into password_reset_tokens ${sql(store.passwordResetTokens.map(resetToRow))}`;
  }

  await sql`
    insert into app_counters (id, invoice_counter, order_counter)
    values (1, ${store.invoiceCounter}, ${store.orderCounter})
    on conflict (id) do update set
      invoice_counter = excluded.invoice_counter,
      order_counter = excluded.order_counter
  `;
}
