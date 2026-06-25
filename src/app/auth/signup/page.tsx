"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import {
  PASSWORD_RULES,
  passwordMeetsRules,
  passwordsMatch,
} from "@/lib/password-validation";
import { cn } from "@/lib/cn";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ruleStatus = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) })),
    [password]
  );

  const confirmOk = passwordsMatch(password, confirmPassword);
  const showConfirmHint = confirmPassword.length > 0;

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
    const result = await signUp({ name, email, password });
    setLoading(false);

    if (result.success) {
      router.push("/products");
    } else {
      setError(result.error || "Sign up failed.");
    }
  };

  return (
    <div className="mesh-bg flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary">
            <HeartPulse className="h-7 w-7 text-white" />
          </div>
          <h1 className="section-title">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Join MedLive Healthcare to order medical equipment across India
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <Input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                icon={<User />}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                icon={<Mail />}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
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
                      "flex items-center gap-2 font-medium transition-colors",
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Confirm Password
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
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !passwordMeetsRules(password) || !confirmOk}
            className="btn-primary mt-6 w-full py-3.5 text-sm disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
