import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "auth_ok";
const PASSWORD = process.env.DASHBOARD_PASSWORD || "changeme123"; // set via .env.local

export async function checkAuth(): Promise<boolean> {
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value === "true";
}

export async function requireAuth(req: Request): Promise<NextResponse | null> {
  const ok = await checkAuth();
  if (ok) return null;
  return NextResponse.redirect(new URL("/login", req.url));
}

export async function handleLogin(req: Request): Promise<NextResponse> {
  const form = await req.formData();
  const pass = form.get("password")?.toString() ?? "";
  if (pass === PASSWORD) {
    const res = NextResponse.redirect(new URL("/offers", req.url));
    res.cookies.set(COOKIE_NAME, "true", { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  }
  return NextResponse.redirect(new URL("/login?error=1", req.url));
}

export async function handleLogout(req: Request): Promise<NextResponse> {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" });
  return res;
}