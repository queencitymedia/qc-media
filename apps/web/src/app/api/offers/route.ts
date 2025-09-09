import { NextResponse } from "next/server";
import { readOffers, upsertOffer } from "../../../lib/offers";

export async function GET() {
  const list = await readOffers();
  return NextResponse.json(list, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const item = await upsertOffer(body);
    return NextResponse.json({ ok: true, id: item.id }, { status: 201 });
  } catch (e: any) {
    const code = e?.message === "title_required" ? 400 : 500;
    return NextResponse.json({ ok: false, error: e?.message ?? "error" }, { status: code });
  }
}