export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { readOffer, updateOffer, deleteOffer } from "@/lib/offers";

// Next 15: params is a Promise; await it before use.
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const num = Number(id);
  const offer = await readOffer(num);
  if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(offer);
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const num = Number(id);
  const body = await req.json().catch(() => ({}));
  const patch: any = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.price_usd === "number") patch.price_usd = body.price_usd;

  const updated = await updateOffer(num, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const num = Number(id);
  const ok = await deleteOffer(num);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}