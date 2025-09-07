import { NextResponse } from "next/server";
import { listOffers, createOffer } from "../../../lib/offers";

export async function GET() {
  const items = listOffers();
  const res = NextResponse.json(items, { status: 200 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const created = createOffer({
    title: body?.title ?? body?.name,
    price_usd: typeof body?.price_usd === "number" ? body.price_usd : undefined,
    summary: body?.summary,
    features: Array.isArray(body?.features) ? body.features : undefined
  });
  const res = NextResponse.json(created, { status: 201 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}