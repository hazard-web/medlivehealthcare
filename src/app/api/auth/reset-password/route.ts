import { NextResponse } from "next/server";
import { resetPasswordWithToken, validatePasswordResetToken } from "@/lib/server/auth";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
  }

  const result = await validatePasswordResetToken(token);
  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ valid: true, email: result.email });
}

export async function POST(request: Request) {
  let body: { token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.token || !body.password) {
    return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
  }

  const result = await resetPasswordWithToken(body.token, body.password);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
