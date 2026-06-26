"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[checkout]", error);
  }, [error]);

  return (
    <div className="container-app flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-7 w-7 text-red-600" />
      </div>
      <h1 className="mt-5 text-xl font-semibold text-slate-900">Checkout could not load</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Try again, or return to your cart. If this keeps happening, sign out and sign back in.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary px-6 py-2.5 text-sm">
          Try again
        </button>
        <Link href="/cart" className="btn-secondary px-6 py-2.5 text-sm">
          Back to cart
        </Link>
      </div>
    </div>
  );
}
