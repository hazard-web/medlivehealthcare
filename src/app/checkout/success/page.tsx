"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, Download } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") || "N/A";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="animate-fade-in">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100">
          <CheckCircle2 className="h-10 w-10 text-teal-600" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900">Payment Successful!</h1>
        <p className="mt-3 text-lg text-slate-500">
          Thank you for your order. Your medical equipment is being prepared for
          shipment.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Package className="h-5 w-5 text-teal-600" />
            <div>
              <p className="text-sm text-slate-500">Order Number</p>
              <p className="font-mono font-semibold text-slate-900">{orderId}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-900">Status:</span>{" "}
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-700">
                Paid — Processing
              </span>
            </p>
            <p>
              <span className="font-medium text-slate-900">Estimated delivery:</span>{" "}
              3–7 business days across India
            </p>
            <p>
              <span className="font-medium text-slate-900">Confirmation sent to:</span>{" "}
              your registered email
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Print Receipt
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Payment processed securely via Razorpay. A confirmation has been sent to your email.
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
