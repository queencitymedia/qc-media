import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };
type Table = Map<string, Bucket>;

const GLB_KEY = "__rate_table__";
function table(): Table {
  const g = globalThis as any;
  if (!g[GLB_KEY]) g[GLB_KEY] = new Map() as Table;
  return g[GLB_KEY] as Table;
}

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for") || "";
  const first = xf.split(",")[0].trim();
  const ip = first || (req.headers.get("x-real-ip") || "local");
  return ip;
}

/**
 * Enforce simple per-IP rate limit
 * @param req
 * @param scope label for keying buckets (e.g. "offers")
 * @param limit requests per window
 * @param windowMs window length in ms
 */
export function enforceRate(
  req: Request, scope = "offers", limit = 60, windowMs = 60_000
): { ok: true; headers: Record<string,string> } | { ok: false; response: NextResponse } {
  const ip = clientIp(req);
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const tbl = table();
  const b = tbl.get(key);

  if (!b || b.resetAt <= now) {
    tbl.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    b.count++;
    if (b.count > limit) {
      const retry = Math.max(0, Math.ceil((b.resetAt - now) / 1000));
      const res = NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
      res.headers.set("Retry-After", String(retry));
      res.headers.set("X-RateLimit-Limit", String(limit));
      res.headers.set("X-RateLimit-Remaining", "0");
      res.headers.set("X-RateLimit-Reset", String(Math.floor(b.resetAt/1000)));
      return { ok: false, response: res };
    }
  }

  const cur = tbl.get(key)!;
  const remaining = Math.max(0, limit - cur.count);
  const headers: Record<string,string> = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.floor(cur.resetAt/1000)),
  };
  return { ok: true, headers };
}