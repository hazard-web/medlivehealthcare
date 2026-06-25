import { NextResponse } from "next/server";
import { getSessionUser, signOutSession, toPublicUser } from "@/lib/server/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: toPublicUser(user) });
}

export async function DELETE() {
  await signOutSession();
  return NextResponse.json({ success: true });
}
