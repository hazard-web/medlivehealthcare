import { NextResponse } from "next/server";
import { sendOtp } from "@/lib/server/otp";

export async function POST(request: Request) {
  let body: { phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.phone) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  const result = await sendOtp(body.phone);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
