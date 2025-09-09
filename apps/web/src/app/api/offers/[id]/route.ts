import { NextResponse } from "next/server";
import { getOffer, upsertOffer, removeOffer } from "../../../../lib/offers";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, ctx: Ctx) {
  const item = await getOffer(ctx.params.id);
  if (!item) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json(item, { status: 200 });
}

export async function PUT(req: Request, ctx: Ctx) {
  const id = ctx.params.id;
  try {
    const body = await req.json().catch(() => ({}));
    const item = await upsertOffer({ id, ...body });
    return NextResponse.json(item, { status: 200 });
  } catch (e: any) {
    const code = e?.message === "title_required" ? 400 : 500;
    return NextResponse.json({ ok: false, error: e?.message ?? "error" }, { status: code });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const ok = await removeOffer(ctx.params.id);
  if (!ok) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}