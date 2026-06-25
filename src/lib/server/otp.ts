import { mutateStore, purgeExpired } from "./store";

const OTP_TTL_MS = 10 * 60 * 1000;

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendOtp(phone: string): Promise<{ success: true; demoOtp?: string } | { error: string }> {
  const cleaned = phone.replace(/\D/g, "").slice(-10);
  if (cleaned.length !== 10) {
    return { error: "Enter a valid 10-digit mobile number." };
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  await mutateStore((store) => {
    purgeExpired(store);
    store.otpCodes = store.otpCodes.filter((o) => o.phone !== cleaned);
    store.otpCodes.push({ phone: cleaned, code, expiresAt });
  });

  const result: { success: true; demoOtp?: string } = { success: true };
  if (process.env.NODE_ENV !== "production") {
    result.demoOtp = code;
  }
  return result;
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ valid: true } | { error: string }> {
  const cleaned = phone.replace(/\D/g, "").slice(-10);
  const store = await mutateStore((store) => {
    purgeExpired(store);
    return store;
  });

  const record = store.otpCodes.find((o) => o.phone === cleaned);
  if (!record) return { error: "OTP expired or not found. Request a new code." };
  if (record.code !== code.trim()) return { error: "Invalid OTP. Please try again." };

  await mutateStore((s) => {
    s.otpCodes = s.otpCodes.filter((o) => o.phone !== cleaned);
  });

  return { valid: true };
}
