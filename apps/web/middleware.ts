import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/offers") || pathname.startsWith("/api/offers")) {
    const auth = req.cookies.get("auth_ok")?.value === "true";
    if (!auth) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/offers/:path*", "/api/offers/:path*"],
};