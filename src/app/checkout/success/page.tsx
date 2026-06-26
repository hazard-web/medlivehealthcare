"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Download, Package, Loader2 } from "lucide-react";
import OrderPlacedAnimation from "@/components/OrderPlacedAnimation";
import { fetchOrderByIdFromApi } from "@/lib/orders-api";
import { formatPrice } from "@/lib/products";
import { Order } from "@/lib/types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const method = searchParams.get("method") ?? "razorpay";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    fetchOrderByIdFromApi(orderId)
      .then((found) => setOrder(found))
      .finally(() => setLoading(false));
  }, [orderId]);

  const isCod = method === "cod";
  const orderLabel = order?.orderNumber ?? orderId ?? "N/A";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="animate-fade-in text-primary-600">
        <OrderPlacedAnimation />

        <h1 className="animate-slide-up text-3xl font-bold text-slate-900">
          {isCod ? "Order placed!" : "Payment successful!"}
        </h1>
        <p className="animate-slide-up mt-3 text-lg text-slate-500 [animation-delay:120ms]">
          {isCod
            ? "Your order is confirmed. Pay when your package arrives."
            : "Thank you! Your payment went through and your order is confirmed."}
        </p>

        <div className="animate-slide-up mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm [animation-delay:220ms]">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Package className="h-5 w-5 text-primary-600" />
            <div>
              <p className="text-sm text-slate-500">Order number</p>
              {loading ? (
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : (
                <p className="font-mono font-semibold text-slate-900">{orderLabel}</p>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-900">Status:</span>{" "}
              <span className="rounded-full bg-primary-50 px-2 py-0.5 font-semibold text-primary-700">
                {isCod ? "Confirmed — Cash on Delivery" : "Paid — Processing"}
              </span>
            </p>
            {order?.total ? (
              <p>
                <span className="font-medium text-slate-900">Order total:</span>{" "}
                {formatPrice(order.total)}
              </p>
            ) : null}
            <p>
              <span className="font-medium text-slate-900">Estimated delivery:</span>{" "}
              3–7 business days across India
            </p>
          </div>
        </div>

        <div className="animate-slide-up mt-8 flex flex-wrap justify-center gap-4 [animation-delay:320ms]">
          {orderId ? (
            <Link
              href={`/account/orders/${orderId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
            >
              View order
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Print receipt
          </button>
        </div>

        <p className="animate-slide-up mt-8 text-xs text-slate-400 [animation-delay:400ms]">
          {isCod
            ? "Your order appears in Order History under My Account."
            : "Payment processed securely via Razorpay. Your order is saved in Order History."}
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
