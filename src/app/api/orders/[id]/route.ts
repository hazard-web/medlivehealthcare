import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { isDatabaseConfigured } from "@/lib/server/db";
import { canAccessOrder } from "@/lib/server/order-access";
import { dbFindOrderByIdOrNumber, dbUpdateOrder } from "@/lib/server/supabase-store";
import { mutateStore } from "@/lib/server/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const order = isDatabaseConfigured()
    ? await dbFindOrderByIdOrNumber(id)
    : (await mutateStore((s) => s)).orders.find((o) => o.id === id || o.orderNumber === id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!canAccessOrder(sessionUser, order)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ order });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: {
    productIds?: string[];
    reason?: string;
    comments?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.productIds?.length || !body.reason) {
    return NextResponse.json({ error: "Return details are required." }, { status: 400 });
  }

  if (isDatabaseConfigured()) {
    const order = await dbFindOrderByIdOrNumber(id);
    if (!order || order.userId !== sessionUser.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 400 });
    }
    if (order.returnRequest) {
      return NextResponse.json({ error: "Return already requested for this order." }, { status: 400 });
    }

    const returnableTotal = order.items
      .filter((i) => body.productIds!.includes(i.productId))
      .reduce((sum, i) => sum + i.lineTotal, 0);

    const refundAmount =
      Math.round(
        (returnableTotal - (order.promoDiscount * returnableTotal) / order.subtotal) * 1.12 * 100
      ) / 100;

    order.returnRequest = {
      id: `ret_${crypto.randomUUID()}`,
      productIds: body.productIds!,
      reason: body.reason!,
      comments: body.comments,
      refundMethod: order.paymentMethod === "cod" ? "cod_refund" : "original_payment",
      status: "requested",
      createdAt: new Date().toISOString(),
      refundAmount,
    };
    order.status = "return_requested";
    await dbUpdateOrder(order);

    return NextResponse.json({ order, returnRequest: order.returnRequest });
  }

  const result = await mutateStore((store) => {
    const order = store.orders.find((o) => o.id === id);
    if (!order || order.userId !== sessionUser.id) return { error: "Order not found" };

    if (order.returnRequest) return { error: "Return already requested for this order." };

    const returnableTotal = order.items
      .filter((i) => body.productIds!.includes(i.productId))
      .reduce((sum, i) => sum + i.lineTotal, 0);

    const refundAmount = Math.round(
      (returnableTotal - (order.promoDiscount * returnableTotal) / order.subtotal) * 1.12 * 100
    ) / 100;

    order.returnRequest = {
      id: `ret_${crypto.randomUUID()}`,
      productIds: body.productIds!,
      reason: body.reason!,
      comments: body.comments,
      refundMethod: order.paymentMethod === "cod" ? "cod_refund" : "original_payment",
      status: "requested",
      createdAt: new Date().toISOString(),
      refundAmount,
    };
    order.status = "return_requested";

    return { order };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ order: result.order, returnRequest: result.order.returnRequest });
}
