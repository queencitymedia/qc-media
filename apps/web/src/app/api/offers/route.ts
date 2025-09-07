import { NextResponse } from "next/server";
import { listOffers, createOffer } from "../../../lib/offers";

export async function GET() {
  const list = await listOffers();
  return NextResponse.json(list, { status: 200 });
}

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const name = typeof body?.name === "string" ? body.name : "Untitled";
  const price = typeof body?.price_usd === "number" ? body.price_usd : undefined;
  const summary = typeof body?.summary === "string" ? body.summary : undefined;
  const features = Array.isArray(body?.features) ? body.features : undefined;
  const created = await createOffer({ name, price_usd: price, summary, features });
  return NextResponse.json(created, { status: 201 });
}

export function OPTIONS() {
  return NextResponse.json({ ok: true }, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}