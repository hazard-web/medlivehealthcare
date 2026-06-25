import { NextResponse } from "next/server";
import { getSessionUser, saveUserAddress, toPublicUser } from "@/lib/server/auth";
import { SavedAddress } from "@/lib/types";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: { address?: SavedAddress; makeDefault?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  const updated = await saveUserAddress(user.id, body.address, body.makeDefault ?? false);
  if (!updated) {
    return NextResponse.json({ error: "Could not save address" }, { status: 400 });
  }

  return NextResponse.json({ user: toPublicUser(updated) });
}
