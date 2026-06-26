import { NextResponse } from "next/server";

/** Return a JSON error instead of an empty 500 when the store/DB throws. */
export function apiError(error: unknown, fallback = "Something went wrong. Please try again.") {
  console.error(error);
  const message =
    error instanceof Error && error.message ? error.message : fallback;
  const isDev = process.env.NODE_ENV !== "production";
  return NextResponse.json(
    { error: isDev ? message : fallback },
    { status: 500 }
  );
}
