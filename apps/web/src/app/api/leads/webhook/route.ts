import { NextResponse } from "next/server";
import { listLeads } from "../../../../lib/leads";
export const runtime = "nodejs";

// Posts the most recent lead to the given URL (?to=...)
export async function POST(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get("to");
  if (!target) return NextResponse.json({ error: "Missing ?to=<webhook_url>" }, { status: 400 });

  const leads = await listLeads();
  const latest = leads.at(-1);
  if (!latest) return NextResponse.json({ error: "No leads" }, { status: 404 });

  try {
    const res = await fetch(target, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(latest) });
    const ok = res.ok; const text = await res.text();
    return NextResponse.json({ ok, status: res.status, body: text.slice(0, 500) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "fetch error" }, { status: 502 });
  }
}
