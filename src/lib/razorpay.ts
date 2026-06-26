import crypto from "crypto";
import Razorpay from "razorpay";

export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const config = getRazorpayConfig();
  if (!config) return false;
  const expected = crypto
    .createHmac("sha256", config.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  return expected === razorpaySignature;
}

export function getRazorpayConfig() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

export function createRazorpayClient(): Razorpay | null {
  const config = getRazorpayConfig();
  if (!config) return null;
  return new Razorpay({
    key_id: config.keyId,
    key_secret: config.keySecret,
  });
}

/** Razorpay receipt must be ≤ 40 characters. */
export function sanitizeReceipt(receipt?: string): string {
  const fallback = `ml_${Date.now()}`;
  if (!receipt) return fallback.slice(0, 40);
  const cleaned = receipt.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  return cleaned || fallback.slice(0, 40);
}

export function razorpayErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "error" in err) {
    const razorpayError = (err as { error?: { description?: string } }).error;
    if (razorpayError?.description) return razorpayError.description;
  }
  if (err instanceof Error && err.message) return err.message;
  return "Failed to create order";
}
