"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CreditCard, Loader2, Lock, Smartphone } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { razorpayCheckoutConfig } from "@/lib/razorpay-checkout";
import { unlockPageScroll } from "@/lib/razorpay-scroll";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface RazorpayPaymentProps {
  amount: number;
  checkoutToken?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  receipt?: string;
  onSuccess: (paymentId: string, razorpayOrderId: string) => void;
}

export default function RazorpayPayment({
  amount,
  checkoutToken,
  userName,
  userEmail,
  userPhone,
  receipt,
  onSuccess,
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState("");
  const openedRef = useRef(false);

  const openRazorpay = useCallback(async () => {
    setError("");
    setLoading(true);
    setDismissed(false);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setError("Could not load Razorpay. Check your internet connection and try again.");
        setLoading(false);
        return;
      }

      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          checkoutToken,
          receipt: receipt || `ml_${Date.now()}`,
          notes: { email: userEmail },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.error || "Could not start payment. Please try again.");
        setLoading(false);
        return;
      }

      const contact = userPhone?.replace(/\D/g, "").slice(-10);

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MedLive Healthcare",
        description: "Medical supplies order",
        order_id: orderData.orderId,
        config: razorpayCheckoutConfig(),
        prefill: {
          name: userName,
          email: userEmail,
          contact,
        },
        theme: { color: "#0d9488" },
        handler: async (response) => {
          unlockPageScroll();
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.valid) {
            setError(verifyData.error || "Payment verification failed. Contact support.");
            setLoading(false);
            return;
          }

          onSuccess(verifyData.paymentId, verifyData.orderId);
        },
        modal: {
          ondismiss: () => {
            unlockPageScroll();
            setLoading(false);
            setDismissed(true);
          },
        },
      });

      rzp.on("payment.failed", (response) => {
        unlockPageScroll();
        setError(response.error.description || "Payment failed. Please try again.");
        setLoading(false);
        setDismissed(true);
      });

      rzp.open();
      setLoading(false);
    } catch {
      unlockPageScroll();
      setError("Something went wrong. Please try again.");
      setLoading(false);
      setDismissed(true);
    }
  }, [amount, checkoutToken, onSuccess, receipt, userEmail, userName, userPhone]);

  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    const timer = window.setTimeout(() => openRazorpay(), 300);
    return () => window.clearTimeout(timer);
  }, [openRazorpay]);

  useEffect(() => {
    return () => unlockPageScroll();
  }, []);

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
          <Lock className="h-6 w-6 text-primary-700" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-slate-900">Secure payment via Razorpay</h3>
          <p className="mt-1 text-sm text-slate-500">
            Pay {formatPrice(amount)} with UPI, cards, net banking, or wallets in the Razorpay
            checkout window.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2">
          <Smartphone className="h-4 w-4 text-primary-600" />
          UPI
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2">
          <CreditCard className="h-4 w-4 text-primary-600" />
          Cards
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2">
          Netbanking
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2">
          Wallets
        </span>
      </div>

      {loading && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
          <Loader2 className="h-4 w-4 animate-spin" />
          Opening Razorpay checkout…
        </div>
      )}

      {dismissed && !loading && (
        <p className="mt-6 text-sm text-slate-500">
          Payment window closed. Tap below to open it again.
        </p>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={openRazorpay}
        disabled={loading}
        className="btn-primary mt-6 w-full py-4 text-base disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Opening…
          </>
        ) : (
          <>Pay {formatPrice(amount)}</>
        )}
      </button>

      <p className="mt-4 text-center text-xs text-slate-400">
        Secured by Razorpay · 256-bit encryption
      </p>
    </div>
  );
}
