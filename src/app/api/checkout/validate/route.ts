import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { apiError } from "@/lib/server/api-error";
import { createCheckoutToken, CartLineInput } from "@/lib/server/checkout";

export async function POST(request: Request) {
  try {
    let body: {
      lines?: CartLineInput[];
      promoCode?: string;
      shippingState?: string;
      gstin?: string;
      guestPhone?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!body.lines?.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    if (!body.shippingState?.trim()) {
      return NextResponse.json({ error: "Shipping state is required." }, { status: 400 });
    }

    const sessionUser = await getSessionUser();

    const result = await createCheckoutToken({
      lines: body.lines,
      promoCode: body.promoCode,
      shippingState: body.shippingState,
      gstin: body.gstin,
      userId: sessionUser?.id ?? null,
      guestPhone: body.guestPhone ?? sessionUser?.phone,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return apiError(error, "Could not validate checkout. Please try again.");
  }
}
