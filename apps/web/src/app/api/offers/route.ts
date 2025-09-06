import { NextResponse } from "next/server";
import { getAllOffers, createOffer } from "../../../lib/offers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/offers
export async function GET() {
  try {
    const all = await getAllOffers();
    return NextResponse.json(all, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

// POST /api/offers
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const price = Number.isFinite(Number(body?.price_usd)) ? Number(body.price_usd) : undefined;
    const summary = typeof body?.summary === "string" ? body.summary : undefined;
    const features = Array.isArray(body?.features) ? body.features.filter((x:any)=>typeof x==="string" && x.trim()) : undefined;

    const created = await createOffer({ name, price_usd: price, summary, features });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
