import { NextResponse } from "next/server";
import { createRazorpayClient, getRazorpayConfig, razorpayErrorMessage, sanitizeReceipt } from "@/lib/razorpay";
import { getCheckoutToken } from "@/lib/server/checkout";
import { isDatabaseConfigured } from "@/lib/server/db";
import { dbFindOrderByIdOrNumber } from "@/lib/server/supabase-store";
import { mutateStore } from "@/lib/server/store";

export async function POST(request: Request) {
  const config = getRazorpayConfig();
  if (!config) {
    return NextResponse.json(
      { error: "Razorpay is not configured. Add API keys to your environment." },
      { status: 503 }
    );
  }

  let body: {
    amount?: number;
    receipt?: string;
    notes?: Record<string, string>;
    checkoutToken?: string;
    medliveOrderId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let amount = body.amount;
  if (body.medliveOrderId) {
    const order = isDatabaseConfigured()
      ? await dbFindOrderByIdOrNumber(body.medliveOrderId)
      : (await mutateStore((s) => s)).orders.find(
          (o) => o.id === body.medliveOrderId || o.orderNumber === body.medliveOrderId
        );
    if (!order) {
      return NextResponse.json({ error: "Order not found. Please refresh checkout." }, { status: 400 });
    }
    amount = order.total;
  } else if (body.checkoutToken) {
    const checkout = await getCheckoutToken(body.checkoutToken);
    if (!checkout) {
      return NextResponse.json({ error: "Checkout session expired. Please try again." }, { status: 400 });
    }
    amount = checkout.total;
  }

  if (typeof amount !== "number" || amount < 1) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const razorpay = createRazorpayClient();
  if (!razorpay) {
    return NextResponse.json({ error: "Razorpay client unavailable" }, { status: 503 });
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: sanitizeReceipt(body.receipt),
      notes: {
        ...body.notes,
        checkoutToken: body.checkoutToken ?? "",
        medliveOrderId: body.medliveOrderId ?? "",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.keyId,
    });
  } catch (err) {
    return NextResponse.json({ error: razorpayErrorMessage(err) }, { status: 500 });
  }
}
