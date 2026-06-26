import { NextResponse } from "next/server";
import { getRazorpayConfig, verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const config = getRazorpayConfig();
  if (!config) {
    return NextResponse.json({ error: "Razorpay is not configured" }, { status: 503 });
  }

  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ valid: false, error: "Invalid signature" }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
  });
}
