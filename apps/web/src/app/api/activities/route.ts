export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { listActivities, createActivity } from "../../../lib/activities";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const lead = url.searchParams.get("lead");
    let rows = await listActivities();
    if (lead) rows = rows.filter(r => String(r.lead_id) === lead);
    if (q) {
      rows = rows.filter(r =>
        [r.summary, r.details, r.type]
          .filter(Boolean).some(v => String(v).toLowerCase().includes(q))
      );
    }
    rows.sort((a,b)=> (b.created_at > a.created_at ? 1 : -1));
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const act = await createActivity(body);
    return NextResponse.json(act, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
