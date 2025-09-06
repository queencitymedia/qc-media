export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { readOffers, createOffer } from "../../../lib/offers";

export async function GET() {
  const offers = await readOffers();
  return NextResponse.json(offers);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (typeof body?.name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const created = await createOffer({ name: body.name, price_usd: typeof body.price_usd === "number" ? body.price_usd : undefined });
  return NextResponse.json(created, { status: 201 });
}