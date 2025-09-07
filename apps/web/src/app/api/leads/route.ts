export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { listLeads, createLead } from "../../../lib/leads";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    let leads = await listLeads();
    if (q) {
      leads = leads.filter(l =>
        [l.name, l.email, l.phone, l.company, l.notes]
          .filter(Boolean).some(v => String(v).toLowerCase().includes(q))
      );
    }
    return NextResponse.json(leads);
  } catch (e: any) {
    console.error("GET /api/leads error:", e);
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lead = await createLead(body);
    return NextResponse.json(lead, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/leads error:", e);
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
