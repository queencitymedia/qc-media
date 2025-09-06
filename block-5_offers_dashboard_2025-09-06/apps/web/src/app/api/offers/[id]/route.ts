
import { NextRequest } from "next/server";
import { readOffers, writeOffers } from "@/src/lib/offers";
import type { Offer } from "@/src/lib/types";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return new Response(JSON.stringify({ error: "Invalid id" }), { status: 400 });
    }
    const body = await req.json();
    const updates: Partial<Offer> = {};
    if (typeof body.name === "string") updates.name = body.name;
    if (body.price_usd === null || typeof body.price_usd === "number") updates.price_usd = body.price_usd;

    const list = await readOffers();
    const idx = list.findIndex((o) => o.id === id);
    if (idx === -1) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }
    const merged = { ...list[idx], ...updates };
    list[idx] = merged;
    await writeOffers(list);
    return Response.json({ item: merged });
  } catch (err: any) {
    console.error("PATCH /api/offers/[id] error", err);
    return new Response(JSON.stringify({ error: "Failed to update offer" }), { status: 500 });
  }
}
