import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { reserveOrderFromCheckout } from "@/lib/server/checkout";
import { SavedAddress } from "@/lib/types";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: {
    checkoutToken?: string;
    paymentMethod?: "razorpay" | "cod";
    shippingAddress?: SavedAddress;
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

  const result = await reserveOrderFromCheckout({
    checkoutToken: body.checkoutToken,
    paymentMethod: body.paymentMethod ?? "razorpay",
    shippingAddress: body.shippingAddress,
    userId: sessionUser.id,
    guestPhone: sessionUser.phone ?? undefined,
    guestEmail: sessionUser.email || undefined,
    guestName: sessionUser.name,
    pincode: body.pincode,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ order: result });
}
