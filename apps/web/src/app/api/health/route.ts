import { NextResponse } from "next/server";
import { auditAppend } from "../../../lib/audit";
import { limit } from "../../../lib/ratelimit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const h = (req as any).headers ? Object.fromEntries((req as any).headers) : {};
  const ip = (h["x-forwarded-for"]?.toString() || "").split(",")[0]?.trim() || "unknown";
  const key = `health:${ip}`;
  const allowed = limit.check(key);

  const body = { ok: true, at: new Date().toISOString(), rateLimited: !allowed };
  const res = NextResponse.json(body, { status: 200 });
  Object.entries(limit.headers).forEach(([k, v]) => res.headers.set(k, String(v)));

  await auditAppend({ at: new Date().toISOString(), ip, method: "GET", path: "/api/health", status: 200, note: allowed ? "ok" : "limited" });
  return res;
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true }, { status: 200 });
}