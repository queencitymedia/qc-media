import { NextResponse } from "next/server";
import { getLead, updateLead, deleteLead } from "../../../../lib/leads";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string }}) {
  const lead = await getLead(Number(params.id));
  return lead ? NextResponse.json(lead) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const patch = await req.json();
  const lead = await updateLead(Number(params.id), patch);
  return lead ? NextResponse.json(lead) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(_req: Request, { params }: { params: { id: string }}) {
  const ok = await deleteLead(Number(params.id));
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
