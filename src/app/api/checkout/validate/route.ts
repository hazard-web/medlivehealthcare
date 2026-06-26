import { NextResponse } from "next/server";
import { getSessionUser, saveUserAddress, toPublicUser } from "@/lib/server/auth";
import { apiError } from "@/lib/server/api-error";
import { createCheckoutToken, CartLineInput } from "@/lib/server/checkout";
import { SavedAddress } from "@/lib/types";

export async function POST(request: Request) {
  try {
    let body: {
      lines?: CartLineInput[];
      promoCode?: string;
      shippingState?: string;
      gstin?: string;
      guestPhone?: string;
      saveAddress?: SavedAddress;
      makeDefault?: boolean;
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

    const [result, updatedUser] = await Promise.all([
      createCheckoutToken({
        lines: body.lines,
        promoCode: body.promoCode,
        shippingState: body.shippingState,
        gstin: body.gstin,
        userId: sessionUser?.id ?? null,
        guestPhone: body.guestPhone ?? sessionUser?.phone,
      }),
      sessionUser && body.saveAddress
        ? saveUserAddress(sessionUser.id, body.saveAddress, body.makeDefault ?? false)
        : Promise.resolve(null),
    ]);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ...result,
      user: updatedUser ? toPublicUser(updatedUser) : undefined,
    });
  } catch (error) {
    return apiError(error, "Could not validate checkout. Please try again.");
  }
}
