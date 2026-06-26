import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { completeOrderPayment, failOrderPayment } from "@/lib/server/checkout";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await context.params;

  let body: {
    action?: "complete" | "fail";
    paymentMethod?: "razorpay" | "cod";
    paymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
    reason?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.action === "fail") {
    const result = await failOrderPayment({
      orderId: id,
      userId: sessionUser.id,
      reason: body.reason,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ order: result });
  }

  const result = await completeOrderPayment({
    orderId: id,
    userId: sessionUser.id,
    paymentMethod: body.paymentMethod ?? "razorpay",
    paymentId: body.paymentId,
    razorpayOrderId: body.razorpayOrderId,
    razorpaySignature: body.razorpaySignature,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ order: result });
}
