"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Banknote, CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { resolveCartLineUnitPrice } from "@/lib/cart-pricing";
import RazorpayPayment from "@/components/RazorpayPayment";
import PromoCodeInput from "@/components/PromoCodeInput";
import OrderSummaryLines from "@/components/OrderSummaryLines";
import ShippingAddressForm from "@/components/ShippingAddressForm";
import {
  formatSavedAddress,
  formToSavedAddress,
  ShippingFormData,
} from "@/lib/addresses";
import { apiFetch, parseApiJson } from "@/lib/api";
import { SavedAddress, User } from "@/lib/types";
import { cn } from "@/lib/cn";

type PaymentMethod = "razorpay" | "cod";

export default function CheckoutPage() {
  const { user, isLoading, updateProfile } = useAuth();
  const {
    items,
    clearCart,
    appliedPromo,
    applyPromo,
    removePromo,
    pincode,
    setPincode,
    pincodeResult,
    checkDeliveryPincode,
    totals,
  } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shipping, setShipping] = useState<ShippingFormData | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<string | null>(null);
  const [checkoutToken, setCheckoutToken] = useState<string | null>(null);
  const [validatedTotal, setValidatedTotal] = useState<number | null>(null);
  const [gstin, setGstin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [placingCod, setPlacingCod] = useState(false);
  const [shippingSubmitting, setShippingSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin?redirect=/checkout");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push("/cart");
    }
  }, [items, isLoading, router]);

  if (isLoading || !user || items.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const displayTotal = validatedTotal ?? totals.total;

  const buildCheckoutLines = () =>
    items.map(({ lineId, product, quantity, variantKey }) => ({
      lineId,
      productId: product.id,
      variantKey,
      quantity,
      unitPrice: resolveCartLineUnitPrice(product.id, variantKey, quantity, product.price),
    }));

  const validateCheckout = async (
    form: ShippingFormData,
    options: { saveToAccount: boolean; makeDefault: boolean; addressId?: string }
  ) => {
    const payload: Record<string, unknown> = {
      lines: buildCheckoutLines(),
      promoCode: appliedPromo?.code,
      shippingState: form.state,
      gstin: gstin.trim() || undefined,
    };

    if (options.saveToAccount) {
      payload.saveAddress = formToSavedAddress(form, {
        id: options.addressId,
        isDefault: options.makeDefault,
      });
      payload.makeDefault = options.makeDefault;
    }

    const res = await apiFetch("/api/checkout/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseApiJson<{
      error?: string;
      token: string;
      total: number;
      user?: User;
    }>(res);
    if (!res.ok) throw new Error(data.error || "Checkout validation failed");
    return data;
  };

  const placeOrder = async (input: {
    paymentMethod: PaymentMethod;
    paymentId?: string;
    razorpayOrderId?: string;
  }) => {
    const shippingForm = shipping;
    if (!shippingForm || !checkoutToken) {
      throw new Error("Checkout session expired");
    }

    const addressSnapshot = formToSavedAddress(shippingForm, { isDefault: false });

    const res = await apiFetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkoutToken,
        paymentMethod: input.paymentMethod,
        shippingAddress: addressSnapshot,
        paymentId: input.paymentId,
        razorpayOrderId: input.razorpayOrderId,
        pincode: shippingForm.pincode,
      }),
    });

    const data = await parseApiJson<{ error?: string; order: { id: string } }>(res);
    if (!res.ok) throw new Error(data.error || "Could not place order");

    sessionStorage.removeItem("medlive_checkout_shipping");
    clearCart();
    router.push(`/checkout/success?order=${data.order.id}`);
  };

  const handleShippingSubmit = async (
    form: ShippingFormData,
    options: { saveToAccount: boolean; makeDefault: boolean; addressId?: string }
  ) => {
    setShippingError(null);

    const pinCheck = checkDeliveryPincode(form.pincode);
    if (!pinCheck.serviceable) {
      setShippingError(pinCheck.message);
      return;
    }

    setPincode(form.pincode);
    setShippingSubmitting(true);

    try {
      const validated = await validateCheckout(form, options);
      setCheckoutToken(validated.token);
      setValidatedTotal(validated.total);
      if (validated.user) {
        updateProfile(validated.user);
      }

      setShipping(form);
      setPaymentReceipt(`ml_${Date.now()}`);
      sessionStorage.setItem("medlive_checkout_shipping", JSON.stringify(form));
      setStep("payment");
    } catch (err) {
      setShippingError(err instanceof Error ? err.message : "Could not validate order");
    } finally {
      setShippingSubmitting(false);
    }
  };

  const handleCodPlace = async () => {
    setShippingError(null);
    setPlacingCod(true);
    try {
      await placeOrder({ paymentMethod: "cod" });
    } catch (err) {
      setShippingError(err instanceof Error ? err.message : "Could not place COD order");
      setPlacingCod(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string, razorpayOrderId: string) => {
    try {
      await placeOrder({ paymentMethod: "razorpay", paymentId, razorpayOrderId });
    } catch (err) {
      setShippingError(err instanceof Error ? err.message : "Order could not be saved");
    }
  };

  const shippingSnapshot: SavedAddress | null = shipping
    ? formToSavedAddress(shipping, { isDefault: false })
    : null;

  return (
    <div className="container-app py-10 sm:py-12">
      <h1 className="section-title mb-2">Checkout</h1>
      <p className="mb-8 text-slate-500">
        Signed in as <span className="font-medium text-slate-700">{user.email || user.phone}</span>
      </p>

      <div className="mb-8 flex gap-4">
        {(["shipping", "payment"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step === s || (s === "shipping" && step === "payment")
                  ? "bg-primary-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-sm font-medium capitalize ${step === s ? "text-slate-900" : "text-slate-400"}`}>
              {s}
            </span>
            {i === 0 && <div className="mx-2 h-px w-8 bg-slate-200" />}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {step === "shipping" ? (
            <div className="space-y-5">
              <div className="card p-5 sm:p-6">
                <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="gstin">
                  GSTIN for tax invoice
                </label>
                <input
                  id="gstin"
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  className="input-field"
                  maxLength={15}
                  autoComplete="off"
                  spellCheck={false}
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  For clinics, nursing homes &amp; GST-registered buyers.
                </p>
              </div>

              <ShippingAddressForm
                user={user}
                pincode={pincode}
                onPincodeChange={setPincode}
                onPincodeCheck={() => checkDeliveryPincode(pincode)}
                pincodeResult={pincodeResult}
                onSubmit={handleShippingSubmit}
                error={shippingError}
                isSubmitting={shippingSubmitting}
              />
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setStep("shipping")}
                className="mb-4 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                ← Edit shipping address
              </button>
              {shippingSnapshot && (
                <div className="card mb-4 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Delivering to</p>
                  <p className="mt-1">
                    {shippingSnapshot.fullName} · {shippingSnapshot.phone}
                  </p>
                  <p className="mt-1">{formatSavedAddress(shippingSnapshot)}</p>
                </div>
              )}

              <div className="card mb-4 p-4">
                <p className="text-sm font-semibold text-slate-900">Payment method</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      { id: "razorpay" as const, label: "Pay online", sub: "UPI, cards, netbanking", icon: CreditCard },
                      { id: "cod" as const, label: "Cash on Delivery", sub: "Pay when your order arrives", icon: Banknote },
                    ] as const
                  ).map(({ id, label, sub, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 text-left transition",
                        paymentMethod === id
                          ? "border-primary-300 bg-primary-50 ring-1 ring-primary-100"
                          : "border-border hover:border-primary-200"
                      )}
                    >
                      <Icon className="mt-0.5 h-5 w-5 text-primary-600" />
                      <span>
                        <span className="block text-sm font-bold text-slate-900">{label}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{sub}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {shippingError && (
                <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{shippingError}</p>
              )}

              {paymentMethod === "razorpay" && paymentReceipt && checkoutToken ? (
                <RazorpayPayment
                  amount={displayTotal}
                  checkoutToken={checkoutToken}
                  userName={shipping?.fullName || user.name}
                  userEmail={user.email}
                  userPhone={shipping?.phone || user.phone}
                  receipt={paymentReceipt}
                  onSuccess={handlePaymentSuccess}
                />
              ) : (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Cash on Delivery</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Pay {formatPrice(displayTotal)} in cash or UPI to the delivery partner when your order arrives.
                  </p>
                  <button
                    type="button"
                    onClick={handleCodPlace}
                    disabled={placingCod || !checkoutToken}
                    className="btn-primary mt-6 w-full py-4 disabled:opacity-60"
                  >
                    {placingCod ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Placing order…
                      </>
                    ) : (
                      <>Place COD order · {formatPrice(displayTotal)}</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="card sticky top-28 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Your Order</h2>
            <ul className="mt-4 space-y-3">
              {items.map(({ lineId, product, quantity }) => (
                <li key={lineId} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-medium text-slate-900">{product.name}</p>
                    <p className="text-slate-500">Qty: {quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(product.price * quantity)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-border pt-5">
              <PromoCodeInput
                appliedCode={appliedPromo?.code}
                appliedLabel={appliedPromo?.label}
                onApply={applyPromo}
                onRemove={removePromo}
              />
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <OrderSummaryLines totals={totals} promoLabel={appliedPromo?.code} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
