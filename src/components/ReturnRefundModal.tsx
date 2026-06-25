"use client";

import { useState } from "react";
import { Loader2, RotateCcw, X } from "lucide-react";
import { formatPrice } from "@/lib/products";
import {
  ReturnReason,
  returnReasonLabel,
  StoredOrder,
} from "@/lib/orders";
import { submitReturnToApi } from "@/lib/orders-api";

const REASONS: ReturnReason[] = [
  "damaged",
  "wrong_item",
  "not_needed",
  "quality_issue",
  "other",
];

interface ReturnRefundModalProps {
  order: StoredOrder;
  open: boolean;
  onClose: () => void;
  onSubmitted: (order: StoredOrder) => void;
}

export default function ReturnRefundModal({
  order,
  open,
  onClose,
  onSubmitted,
}: ReturnRefundModalProps) {
  const [selected, setSelected] = useState<string[]>(
    order.items.map((i) => i.product.id)
  );
  const [reason, setReason] = useState<ReturnReason>("not_needed");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const refundPreview = order.items
    .filter((i) => selected.includes(i.product.id))
    .reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const toggle = (productId: string) => {
    setSelected((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (selected.length === 0) {
      setError("Select at least one item to return.");
      return;
    }

    setLoading(true);
    const result = await submitReturnToApi(order.id, {
      productIds: selected,
      reason,
      comments: comments.trim() || undefined,
    });
    setLoading(false);

    if (!result.success || !result.order) {
      setError(result.error ?? "Could not submit return request.");
      return;
    }

    onSubmitted(result.order as StoredOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <RotateCcw className="h-5 w-5 text-primary-600" />
              Return or refund
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick items and we&apos;ll arrange a pickup. Refund goes to your original
              payment method.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Items to return</p>
            <ul className="space-y-2">
              {order.items.map(({ product, quantity }) => (
                <li key={product.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 hover:bg-surface-muted">
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() => toggle(product.id)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600"
                    />
                    <span className="flex-1 text-sm font-medium text-slate-800">
                      {product.name}
                    </span>
                    <span className="text-sm text-slate-500">Qty {quantity}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Reason for return
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReturnReason)}
              className="input-field"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {returnReasonLabel(r)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Additional comments (optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Tell us more about the issue…"
            />
          </div>

          <div className="rounded-xl bg-surface-muted p-4 text-sm">
            <p className="text-slate-600">Estimated refund</p>
            <p className="text-xl font-bold text-slate-900">{formatPrice(refundPreview)}</p>
            <p className="mt-1 text-xs text-slate-500">
              Refund in 5–7 business days after pickup
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-3 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit return request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
