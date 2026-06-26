"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HeartPulse, Mail, Loader2, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not process your request.");
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary">
            <HeartPulse className="h-7 w-7 text-white" />
          </div>
          <h1 className="section-title">Forgot password?</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your email and we&apos;ll send you a secure link to reset your password.
          </p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <p className="text-sm leading-relaxed text-slate-600">
                If an account exists for <strong>{email}</strong>, check your inbox for reset
                instructions. The link expires in 1 hour.
              </p>
              <Link href="/auth/signin" className="btn-primary mt-6 inline-flex w-full justify-center py-3 text-sm">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                icon={<Mail />}
              />

              {error && (
                <p className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="mt-6 w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}

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
