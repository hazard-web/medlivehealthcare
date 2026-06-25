"use client";

import { useState } from "react";
import { Loader2, Smartphone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PhoneOtpPanelProps {
  onVerified: () => void;
  className?: string;
}

export default function PhoneOtpPanel({ onVerified, className }: PhoneOtpPanelProps) {
  const { sendOtp, signInWithOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const handleSend = async () => {
    setError("");
    setLoading(true);
    const result = await sendOtp(phone);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Could not send OTP");
      return;
    }
    if (result.demoOtp) setDemoOtp(result.demoOtp);
    setStep("otp");
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    const result = await signInWithOtp(phone, code);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Invalid OTP");
      return;
    }
    onVerified();
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Smartphone className="h-4 w-4 text-primary-600" />
        Sign in with mobile OTP
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Faster checkout for caregivers — no password needed.
      </p>

      {step === "phone" ? (
        <div className="mt-3 flex gap-2">
          <input
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="input-field flex-1"
          />
          <button type="button" onClick={handleSend} disabled={loading || phone.length !== 10} className="btn-primary shrink-0 px-4 py-2 text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {demoOtp && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Dev mode OTP: <strong>{demoOtp}</strong>
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="6-digit OTP"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="input-field flex-1"
            />
            <button type="button" onClick={handleVerify} disabled={loading || code.length !== 6} className="btn-primary shrink-0 px-4 py-2 text-sm">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
            </button>
          </div>
          <button type="button" onClick={() => setStep("phone")} className="text-xs font-semibold text-primary-600">
            Change number
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
