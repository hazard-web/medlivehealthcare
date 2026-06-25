"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HeartPulse,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Check,
  X,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  PASSWORD_RULES,
  passwordMeetsRules,
  passwordsMatch,
} from "@/lib/password-validation";
import { cn } from "@/lib/cn";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [email, setEmail] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [checkingToken, setCheckingToken] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const ruleStatus = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) })),
    [password]
  );

  const confirmOk = passwordsMatch(password, confirmPassword);
  const showConfirmHint = confirmPassword.length > 0;

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid reset link. Request a new one from the sign-in page.");
      setCheckingToken(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setTokenError(data.error || "This reset link is invalid or has expired.");
          return;
        }
        setEmail(data.email);
      } catch {
        if (!cancelled) setTokenError("Could not verify reset link.");
      } finally {
        if (!cancelled) setCheckingToken(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordMeetsRules(password)) {
      setError("Password must meet all requirements.");
      return;
    }
    if (!confirmOk) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update password.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/auth/signin"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="text-center">
        <p className="text-sm font-medium text-red-600">{tokenError}</p>
        <Link
          href="/auth/forgot-password"
          className="btn-primary mt-6 inline-flex w-full justify-center py-3 text-sm"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary-600" />
        <p className="mt-4 text-sm font-semibold text-slate-900">Password updated</p>
        <p className="mt-2 text-sm text-slate-500">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 rounded-xl bg-surface-muted px-4 py-3 text-sm text-slate-600">
        Resetting password for <strong className="text-slate-900">{email}</strong>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">New password</label>
          <Input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            icon={<Lock />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          {password.length > 0 && (
            <ul className="mt-3 space-y-1.5 rounded-xl bg-surface-muted px-3 py-3 text-xs">
              {ruleStatus.map(({ id, label, met }) => (
                <li
                  key={id}
                  className={cn(
                    "flex items-center gap-2 font-medium",
                    met ? "text-primary-700" : "text-slate-500"
                  )}
                >
                  {met ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary-600" aria-hidden />
                  ) : (
                    <X className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  )}
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Confirm password
          </label>
          <Input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            icon={<Lock />}
          />
          {showConfirmHint && (
            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-xs font-medium",
                confirmOk ? "text-primary-700" : "text-red-600"
              )}
            >
              {confirmOk ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Passwords match
                </>
              ) : (
                <>
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Passwords do not match
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || !passwordMeetsRules(password) || !confirmOk}
        className="mt-6 w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating…
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mesh-bg flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary">
            <HeartPulse className="h-7 w-7 text-white" />
          </div>
          <h1 className="section-title">Reset password</h1>
          <p className="mt-2 text-sm text-slate-500">Choose a new password for your account.</p>
        </div>

        <div className="card p-8">
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>

          <Link
            href="/auth/signin"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
