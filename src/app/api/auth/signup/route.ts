import { NextResponse } from "next/server";
import {
  createSessionToken,
  setSessionCookie,
  signInUser,
  signUpUser,
  toPublicUser,
} from "@/lib/server/auth";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.name || !body.email || !body.password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }

  const result = await signUpUser({
    name: body.name,
    email: body.email,
    password: body.password,
    phone: body.phone,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const token = await createSessionToken(result.user.id);
  await setSessionCookie(token);

  return NextResponse.json({ user: toPublicUser(result.user) });
}
