import { NextResponse } from "next/server";
import { getOffer, updateOffer, deleteOffer } from "../../../../lib/offers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function idFrom(params: { id?: string }) {
  const n = Number(params?.id);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

// GET /api/offers/:id
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const id = idFrom(ctx.params);
  if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  try {
    const offer = await getOffer(id);
    if (!offer) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(offer, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

// PATCH /api/offers/:id
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const id = idFrom(ctx.params);
  if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  try {
    const body = await req.json().catch(() => ({}));
    const patch: any = {};
    if (typeof body?.name === "string") patch.name = body.name.trim();
    if (body?.price_usd !== undefined) {
      const n = Number(body.price_usd);
      if (Number.isFinite(n)) patch.price_usd = n;
    }
    if (typeof body?.summary === "string") patch.summary = body.summary;
    if (Array.isArray(body?.features)) patch.features = body.features.filter((x:any)=>typeof x==="string" && x.trim());
    const updated = await updateOffer(id, patch);
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(updated, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

// DELETE /api/offers/:id
export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const id = idFrom(ctx.params);
  if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  try {
    const ok = await deleteOffer(id);
    if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}