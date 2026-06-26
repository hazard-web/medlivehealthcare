"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  HelpCircle,
  Loader2,
  MapPin,
  Package,
  RotateCcw,
  Truck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiUrl } from "@/lib/api";
import { formatPrice } from "@/lib/products";
import {
  canReturn,
  estimatedDelivery,
  formatOrderDate,
  formatOrderShipping,
  isCodOrder,
  paymentMethodLabel,
  paymentStatusDetail,
  resolveOrderStatus,
  returnReasonLabel,
  ReturnReason,
  statusHeadline,
  statusTone,
  StoredOrder,
  trackingId,
} from "@/lib/orders";
import { fetchOrderByIdFromApi } from "@/lib/orders-api";
import OrderTrackingTimeline from "@/components/OrderTrackingTimeline";
import ProductImage from "@/components/ProductImage";
import ReturnRefundModal from "@/components/ReturnRefundModal";
import { useChat } from "@/context/ChatContext";

export default function OrderDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const { openChat } = useChat();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/auth/signin?redirect=/account/orders/${orderId}`);
    }
  }, [user, isLoading, router, orderId]);

  useEffect(() => {
    if (!user) return;
    fetchOrderByIdFromApi(orderId).then((apiOrder) => {
      if (apiOrder && (!apiOrder.userId || apiOrder.userId === user.id)) {
        setOrder(apiOrder as StoredOrder);
      }
      setLoaded(true);
    });
  }, [orderId, user]);

  if (isLoading || !user || !loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-app py-16 text-center">
        <Package className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Order not found</h1>
        <Link href="/account" className="btn-primary mt-6 inline-flex px-6 py-3">
          Back to account
        </Link>
      </div>
    );
  }

  const status = resolveOrderStatus(order);
  const showReturn = canReturn(order);
  const shipping = formatOrderShipping(order);

  return (
    <div className="container-app py-8 sm:py-10">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to order history
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="section-title">Order details</h1>
          <p className="mt-1 text-sm text-slate-500">
            Placed on {formatOrderDate(order.createdAt)} · Order #{order.id}
          </p>
        </div>
        <a
          href={apiUrl(`/api/invoice/${order.id}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary px-4 py-2.5 text-sm"
        >
          <Download className="h-4 w-4" />
          GST Invoice
        </a>
      </div>

      {/* Status banner */}
      <div className="card mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-muted/50 px-5 py-4">
          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusTone(status)}`}
            >
              {statusHeadline(status, order.paymentMethod)}
            </span>
            {status !== "delivered" && status !== "refunded" && status !== "return_requested" && (
              <p className="mt-2 text-sm text-slate-600">
                Estimated delivery: <strong>{estimatedDelivery(order)}</strong>
              </p>
            )}
            {order.returnRequest && (
              <p className="mt-2 text-sm text-slate-600">
                Return status:{" "}
                <strong className="capitalize">{order.returnRequest.status.replace("_", " ")}</strong>
                {" · "}
                Refund {formatPrice(order.returnRequest.refundAmount)} to original payment
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="#track" className="btn-primary px-4 py-2.5 text-sm">
              <Truck className="h-4 w-4" />
              Track package
            </a>
            {showReturn && (
              <button
                type="button"
                onClick={() => setReturnOpen(true)}
                className="btn-secondary px-4 py-2.5 text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                Return / refund
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Items in this order
            </h2>
            <ul className="divide-y divide-border rounded-xl border border-border">
              {order.items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4 p-4">
                  <Link
                    href={`/products/${product.id}`}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-white"
                  >
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      productId={product.id}
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium text-slate-900 hover:text-primary-700"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">Qty: {quantity}</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatPrice(product.price * quantity)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                      >
                        Buy it again
                      </Link>
                      {showReturn && (
                        <button
                          type="button"
                          onClick={() => setReturnOpen(true)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                        >
                          Return this item
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MapPin className="h-4 w-4 text-primary-600" />
                Ship to
              </h3>
              {shipping ? (
                <div className="mt-2 text-sm text-slate-600">
                  {shipping.name && (
                    <p className="font-medium text-slate-800">{shipping.name}</p>
                  )}
                  <p className={shipping.name ? "mt-1" : ""}>{shipping.addressLine}</p>
                  {shipping.phone && <p className="mt-1">{shipping.phone}</p>}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Shipping address not saved for this order.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-slate-900">Payment</h3>
              <p className="mt-2 text-sm text-slate-600">{paymentMethodLabel(order)}</p>
              <p className="mt-1 text-xs text-slate-500">{paymentStatusDetail(order)}</p>
              {!isCodOrder(order) && order.paymentId && (
                <p className="mt-1 font-mono text-xs text-slate-400">{order.paymentId}</p>
              )}
            </div>

            <div className="rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-slate-900">Order summary</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {order.subtotal != null && (
                  <div className="flex justify-between text-slate-600">
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(order.subtotal)}</dd>
                  </div>
                )}
                {order.promoDiscount != null && order.promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Promo {order.promoCode ? `(${order.promoCode})` : ""}</dt>
                    <dd>-{formatPrice(order.promoDiscount)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 font-semibold text-slate-900">
                  <dt>Total</dt>
                  <dd>{formatPrice(order.total)}</dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={() =>
                openChat({
                  orderId: order.id,
                  topic: "I need help with this order",
                  order,
                })
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-slate-700 transition hover:bg-surface-muted"
            >
              <HelpCircle className="h-4 w-4" />
              Need help with this order?
            </button>
          </div>
        </div>
      </div>

      {/* Tracking */}
      <div id="track" className="card scroll-mt-28 p-5 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Track package</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tracking ID: <span className="font-mono font-medium">{trackingId(order)}</span>
            </p>
          </div>
        </div>
        <OrderTrackingTimeline order={order} />
      </div>

      {/* Return info */}
      {order.returnRequest && (
        <div className="card mt-6 border-amber-200 bg-amber-50/50 p-5">
          <h2 className="font-semibold text-slate-900">Return & refund</h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between gap-4">
              <dt>Reason</dt>
              <dd className="text-right font-medium">
                {returnReasonLabel(order.returnRequest.reason as ReturnReason)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Refund amount</dt>
              <dd className="font-semibold">{formatPrice(order.returnRequest.refundAmount)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Status</dt>
              <dd className="capitalize font-medium">{order.returnRequest.status}</dd>
            </div>
            {order.returnRequest.comments && (
              <div>
                <dt className="text-slate-500">Your note</dt>
                <dd className="mt-1">{order.returnRequest.comments}</dd>
              </div>
            )}
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            Pickup will be scheduled within 2 business days. Refund is processed after we
            receive the items.
          </p>
        </div>
      )}

      <ReturnRefundModal
        order={order}
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        onSubmitted={setOrder}
      />
    </div>
  );
}
