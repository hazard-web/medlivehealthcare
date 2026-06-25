"use client";

import { useState } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { PROMO_OFFERS } from "@/lib/promo";
import { cn } from "@/lib/cn";

interface PromoCodeInputProps {
  appliedCode?: string | null;
  appliedLabel?: string | null;
  onApply: (code: string) => Promise<{ success: boolean; error?: string }>;
  onRemove: () => void;
  className?: string;
}

export default function PromoCodeInput({
  appliedCode,
  appliedLabel,
  onApply,
  onRemove,
  className,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setError(null);
    setLoading(true);
    const result = await onApply(code);
    setLoading(false);
    if (result.success) {
      setCode("");
    } else {
      setError(result.error || "Could not apply promo code");
    }
  };

  if (appliedCode) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between rounded-lg bg-primary-50 px-3 py-2 ring-1 ring-primary-100">
          <div className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-primary-600" />
            <span className="font-semibold text-primary-800">{appliedCode}</span>
            {appliedLabel && (
              <span className="text-xs text-primary-600">({appliedLabel})</span>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1 text-primary-600 hover:bg-primary-100"
            aria-label="Remove promo code"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary-600" />
        <p className="text-sm font-semibold text-slate-800">Promo code</p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
          placeholder="Enter code"
          className="input-field flex-1 py-2.5 text-sm uppercase"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="btn-secondary shrink-0 px-4 py-2.5 text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-1.5">
        {PROMO_OFFERS.map((offer) => (
          <button
            key={offer.code}
            type="button"
            onClick={() => setCode(offer.code)}
            className="rounded-md bg-surface-muted px-2 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-border hover:bg-primary-50 hover:text-primary-700"
            title={offer.description}
          >
            {offer.code}
          </button>
        ))}
      </div>
    </div>
  );
}
