import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie, signInUser, toPublicUser } from "@/lib/server/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const result = await signInUser(body.email, body.password);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  const token = await createSessionToken(result.user.id);
  await setSessionCookie(token);

  return NextResponse.json({ user: toPublicUser(result.user) });
}
