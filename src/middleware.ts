import { NextRequest, NextResponse } from "next/server";

function allowedOrigins(): string[] {
  const raw = process.env.FRONTEND_URL?.trim();
  if (!raw) return [];
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

export function middleware(request: NextRequest) {
  const origins = allowedOrigins();
  if (!origins.length) return NextResponse.next();

  const origin = request.headers.get("origin");
  const match = origin && origins.includes(origin) ? origin : null;

  if (request.method === "OPTIONS") {
    if (!match) return new NextResponse(null, { status: 204 });
    return new NextResponse(null, { status: 204, headers: corsHeaders(match) });
  }

  const response = NextResponse.next();
  if (match) {
    for (const [key, value] of Object.entries(corsHeaders(match))) {
      response.headers.set(key, value);
    }
  }
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
