"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MapPin, XCircle } from "lucide-react";
import { checkPincode, formatPincodeLocation } from "@/lib/pincode";
import { cn } from "@/lib/cn";

interface PincodeCheckerProps {
  value: string;
  onChange: (pincode: string) => void;
  onCheck?: (pincode: string) => void;
  resultMessage?: string | null;
  serviceable?: boolean | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  eta?: string;
  compact?: boolean;
  className?: string;
}

export default function PincodeChecker({
  value,
  onChange,
  onCheck,
  resultMessage,
  serviceable,
  city: cityProp,
  district: districtProp,
  state: stateProp,
  eta,
  compact = false,
  className,
}: PincodeCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localServiceable, setLocalServiceable] = useState<boolean | null>(null);
  const [localEta, setLocalEta] = useState<string | undefined>();

  const [localCity, setLocalCity] = useState<string | undefined>();
  const [localDistrict, setLocalDistrict] = useState<string | undefined>();
  const [localState, setLocalState] = useState<string | undefined>();

  const message = resultMessage ?? localMessage;
  const isServiceable = serviceable ?? localServiceable;
  const deliveryEta = eta ?? localEta;
  const city = cityProp ?? localCity;
  const district = districtProp ?? localDistrict;
  const state = stateProp ?? localState;
  const locationDetail =
    isServiceable && (city || district || state)
      ? formatPincodeLocation({ town: city ?? undefined, district: district ?? undefined, state: state ?? undefined })
      : null;

  const handleCheck = async () => {
    setChecking(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = checkPincode(value);
    setLocalMessage(result.message);
    setLocalServiceable(result.serviceable);
    setLocalEta(result.eta);
    setLocalCity(result.city);
    setLocalDistrict(result.district);
    setLocalState(result.state);
    onCheck?.(value.trim());
    setChecking(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {!compact && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary-600" />
          <p className="text-sm font-semibold text-slate-800">Check delivery PIN code</p>
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCheck())}
          placeholder="Enter 6-digit PIN"
          className="input-field flex-1 py-2.5 text-sm"
          aria-label="PIN code"
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={checking || value.length !== 6}
          className="btn-primary shrink-0 px-4 py-2.5 text-sm disabled:opacity-50"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
        </button>
      </div>
      {message && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg px-3 py-2 text-xs",
            isServiceable
              ? "bg-primary-50 text-primary-800 ring-1 ring-primary-100"
              : "bg-red-50 text-red-700 ring-1 ring-red-100"
          )}
        >
          {isServiceable ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          <div className="space-y-1">
            {isServiceable && locationDetail ? (
              <p className="leading-snug">
                Delivery available in{" "}
                <span className="font-bold">{locationDetail}</span>
              </p>
            ) : (
              <p className="leading-snug">{message}</p>
            )}
            {isServiceable && deliveryEta && (
              <p className="leading-snug">
                Estimated delivery:{" "}
                <span className="font-bold">{deliveryEta}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
