import { NextResponse } from "next/server";
import { buildGstInvoiceHtml } from "@/lib/gst-invoice";
import { getSessionUser } from "@/lib/server/auth";
import { mutateStore } from "@/lib/server/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  const sessionUser = await getSessionUser();
  const store = await mutateStore((s) => s);
  const order = store.orders.find((o) => o.id === orderId || o.orderNumber === orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (sessionUser && order.userId && order.userId !== sessionUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const html = buildGstInvoiceHtml(order);
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
