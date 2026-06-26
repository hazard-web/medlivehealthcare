import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { createOrderFromCheckout } from "@/lib/server/checkout";
import { isDatabaseConfigured } from "@/lib/server/db";
import { dbFindOrdersByUserId } from "@/lib/server/supabase-store";
import { mutateStore, StoredOrder } from "@/lib/server/store";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { SavedAddress } from "@/lib/types";

export async function POST(request: Request) {
  let body: {
    checkoutToken?: string;
    paymentMethod?: "razorpay" | "cod";
    shippingAddress?: SavedAddress;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
    paymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
    pincode?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.checkoutToken || !body.shippingAddress || !body.pincode) {
    return NextResponse.json({ error: "Missing checkout details." }, { status: 400 });
  }

  const paymentMethod = body.paymentMethod ?? "razorpay";
  const sessionUser = await getSessionUser();

  if (paymentMethod === "razorpay") {
    const { paymentId, razorpayOrderId, razorpaySignature } = body;
    if (!paymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: "Payment verification is required." }, { status: 400 });
    }
    if (!verifyRazorpaySignature(razorpayOrderId, paymentId, razorpaySignature)) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }
  }

  const result = await createOrderFromCheckout({
    checkoutToken: body.checkoutToken,
    paymentMethod,
    shippingAddress: body.shippingAddress,
    userId: sessionUser?.id ?? null,
    guestName: body.guestName,
    guestPhone: body.guestPhone,
    guestEmail: body.guestEmail,
    paymentId: body.paymentId,
    razorpayOrderId: body.razorpayOrderId,
    pincode: body.pincode,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ order: result });
}

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ orders: [] });
  }

  if (isDatabaseConfigured()) {
    const orders = await dbFindOrdersByUserId(sessionUser.id);
    return NextResponse.json({ orders });
  }

  const store = await mutateStore((s) => s);
  const orders = store.orders
    .filter((o) => o.userId === sessionUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ orders });
}
