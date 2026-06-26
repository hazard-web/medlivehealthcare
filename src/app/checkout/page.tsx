"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Banknote, Check, CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { getProductImage } from "@/lib/product-images";
import { resolveCartLineUnitPrice } from "@/lib/cart-pricing";
import { calculateOrderTotals } from "@/lib/orderTotals";
import { validatePromoCode } from "@/lib/promo";
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
import { CartItem, SavedAddress, User } from "@/lib/types";
import { cn } from "@/lib/cn";

type PaymentMethod = "razorpay" | "cod";

function defaultSelectedLineIds(items: CartItem[]): Set<string> {
  const guestLines = items.filter((i) => i.fromGuestSession).map((i) => i.lineId);
  if (guestLines.length > 0) return new Set(guestLines);
  return new Set(items.map((i) => i.lineId));
}

export default function CheckoutPage() {
  const { user, isLoading, updateProfile } = useAuth();
  const {
    items,
    removeItems,
    appliedPromo,
    applyPromo,
    removePromo,
    pincode,
    setPincode,
    pincodeResult,
    checkDeliveryPincode,
    isReady: cartReady,
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
  const [redirecting, setRedirecting] = useState(false);
  const [selectedLineIds, setSelectedLineIds] = useState<Set<string> | null>(null);
  const [orderLineIds, setOrderLineIds] = useState<string[]>([]);

  useEffect(() => {
    if (!cartReady || items.length === 0) return;
    setSelectedLineIds((prev) => {
      if (prev !== null) {
        const valid = new Set(items.map((i) => i.lineId));
        const pruned = new Set([...prev].filter((id) => valid.has(id)));
        return pruned.size > 0 ? pruned : defaultSelectedLineIds(items);
      }
      return defaultSelectedLineIds(items);
    });
  }, [cartReady, items]);

  const selectedItems = useMemo(
    () => (selectedLineIds ? items.filter((i) => selectedLineIds.has(i.lineId)) : []),
    [items, selectedLineIds]
  );

  const selectedSubtotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, i) =>
          sum +
          resolveCartLineUnitPrice(i.product.id, i.variantKey, i.quantity, i.product.price) *
            i.quantity,
        0
      ),
    [selectedItems]
  );

  const selectedPromoDiscount = useMemo(() => {
    if (!appliedPromo) return 0;
    const result = validatePromoCode(appliedPromo.code, selectedSubtotal);
    return result.success ? result.promo.discount : 0;
  }, [appliedPromo, selectedSubtotal]);

  const selectedTotals = useMemo(
    () => calculateOrderTotals(selectedSubtotal, selectedPromoDiscount),
    [selectedSubtotal, selectedPromoDiscount]
  );

  const toggleLineSelection = (lineId: string) => {
    if (step === "payment") return;
    setSelectedLineIds((prev) => {
      const next = new Set(prev ?? []);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
    setCheckoutToken(null);
    setValidatedTotal(null);
    setStep("shipping");
  };

  const toggleSelectAll = () => {
    if (step === "payment" || !selectedLineIds) return;
    const allSelected = selectedLineIds.size === items.length;
    setSelectedLineIds(allSelected ? new Set() : new Set(items.map((i) => i.lineId)));
    setCheckoutToken(null);
    setValidatedTotal(null);
    setStep("shipping");
  };

  useEffect(() => {
    if (!cartReady || isLoading) return;

    if (!user) {
      setRedirecting(true);
      router.replace("/auth/signin?redirect=/checkout");
      return;
    }

    if (items.length === 0) {
      setRedirecting(true);
      router.replace("/cart");
    }
  }, [user, isLoading, cartReady, items.length, router]);

  if (!cartReady || isLoading || redirecting || !user || items.length === 0 || !selectedLineIds) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="text-sm text-slate-500">
          {!cartReady || isLoading
            ? "Loading checkout…"
            : !user
              ? "Sign in to continue checkout…"
              : items.length === 0
                ? "Your cart is empty — redirecting…"
                : "Preparing checkout…"}
        </p>
      </div>
    );
  }

  const displayTotal = validatedTotal ?? selectedTotals.total;

  const buildCheckoutLines = () =>
    selectedItems.map(({ lineId, product, quantity, variantKey }) => ({
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
    razorpaySignature?: string;
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
        razorpaySignature: input.razorpaySignature,
        pincode: shippingForm.pincode,
      }),
    });

    const data = await parseApiJson<{ error?: string; order: { id: string } }>(res);
    if (!res.ok) throw new Error(data.error || "Could not place order");

    sessionStorage.removeItem("medlive_checkout_shipping");
    removeItems(orderLineIds.length > 0 ? orderLineIds : [...selectedLineIds]);
    router.push(`/checkout/success?order=${data.order.id}`);
  };

  const handleShippingSubmit = async (
    form: ShippingFormData,
    options: { saveToAccount: boolean; makeDefault: boolean; addressId?: string }
  ) => {
    setShippingError(null);

    if (selectedItems.length === 0) {
      setShippingError("Select at least one item to place this order.");
      return;
    }

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
      setOrderLineIds(selectedItems.map((i) => i.lineId));
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

  const handlePaymentSuccess = async (
    paymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ) => {
    try {
      await placeOrder({
        paymentMethod: "razorpay",
        paymentId,
        razorpayOrderId,
        razorpaySignature,
      });
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Your Order</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Tick items to include in this order. Unticked items stay in your cart.
                </p>
              </div>
              {step === "shipping" && items.length > 1 ? (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="shrink-0 text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  {selectedLineIds.size === items.length ? "Deselect all" : "Select all"}
                </button>
              ) : null}
            </div>
            <ul className="mt-4 space-y-3">
              {items.map(({ lineId, product, quantity, variantKey, fromGuestSession }) => {
                const lineTotal =
                  resolveCartLineUnitPrice(
                    product.id,
                    variantKey,
                    quantity,
                    product.price
                  ) * quantity;
                const isSelected = selectedLineIds.has(lineId);

                return (
                  <li
                    key={lineId}
                    className={cn(
                      "flex gap-3 rounded-xl border p-2 transition",
                      isSelected
                        ? "border-primary-200 bg-primary-50/40"
                        : "border-transparent opacity-60"
                    )}
                  >
                    <label
                      className={cn(
                        "flex shrink-0 cursor-pointer items-start pt-1",
                        step === "payment" && "cursor-default"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={isSelected}
                        disabled={step === "payment"}
                        onChange={() => toggleLineSelection(lineId)}
                      />
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border transition",
                          isSelected
                            ? "border-primary-600 bg-primary-600 text-white"
                            : "border-slate-300 bg-white text-transparent",
                          step === "payment" && "opacity-80"
                        )}
                        aria-hidden
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <span className="sr-only">
                        {isSelected ? "Included in order" : "Not included in order"}
                      </span>
                    </label>
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="line-clamp-1 font-medium text-slate-900">{product.name}</p>
                      <p className="text-slate-500">Qty: {quantity}</p>
                      {fromGuestSession ? (
                        <p className="text-xs text-primary-700">Added before sign-in</p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-sm font-medium">{formatPrice(lineTotal)}</p>
                  </li>
                );
              })}
            </ul>

            {selectedItems.length === 0 ? (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Select at least one item to continue checkout.
              </p>
            ) : null}

            <div className="mt-5 border-t border-border pt-5">
              <PromoCodeInput
                appliedCode={appliedPromo?.code}
                appliedLabel={appliedPromo?.label}
                onApply={applyPromo}
                onRemove={removePromo}
              />
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <OrderSummaryLines
                totals={selectedTotals}
                promoLabel={appliedPromo?.code}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
