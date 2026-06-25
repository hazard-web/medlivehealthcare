import { NextResponse } from "next/server";
import {
  createSessionToken,
  setSessionCookie,
  toPublicUser,
  upsertPhoneUser,
} from "@/lib/server/auth";
import { verifyOtp } from "@/lib/server/otp";

export async function POST(request: Request) {
  let body: { phone?: string; code?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.phone || !body.code) {
    return NextResponse.json({ error: "Phone and OTP are required." }, { status: 400 });
  }

  const otpResult = await verifyOtp(body.phone, body.code);
  if ("error" in otpResult) {
    return NextResponse.json({ error: otpResult.error }, { status: 400 });
  }

  const user = await upsertPhoneUser(body.phone, body.name);
  const token = await createSessionToken(user.id);
  await setSessionCookie(token);

  return NextResponse.json({ user: toPublicUser(user) });
}
