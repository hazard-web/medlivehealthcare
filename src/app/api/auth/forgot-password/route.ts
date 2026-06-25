import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/server/auth";

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  await requestPasswordReset(body.email);

  return NextResponse.json({
    success: true,
    message:
      "If an account exists for this email, you will receive password reset instructions shortly.",
  });
}
