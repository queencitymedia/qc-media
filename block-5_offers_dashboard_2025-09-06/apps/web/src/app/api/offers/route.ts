
import { NextRequest } from "next/server";
import { readOffers } from "@/src/lib/offers";
import type { Offer } from "@/src/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").toLowerCase();
    const sort = (searchParams.get("sort") || "id") as "id" | "name" | "price";
    const dir = (searchParams.get("dir") || "asc") as "asc" | "desc";
    const minPrice = Number(searchParams.get("minPrice") || "");
    const maxPrice = Number(searchParams.get("maxPrice") || "");

    let items: Offer[] = await readOffers();

    // search
    if (q) {
      items = items.filter((o) => {
        const idStr = String(o.id);
        const nm = (o.name || "").toLowerCase();
        const priceStr = o.price_usd != null ? String(o.price_usd) : "";
        return idStr.includes(q) || nm.includes(q) || priceStr.includes(q);
      });
    }

    // filter
    items = items.filter((o) => {
      const p = o.price_usd ?? null;
      if (!Number.isNaN(minPrice) && searchParams.has("minPrice")) {
        if (p == null || p < minPrice) return false;
      }
      if (!Number.isNaN(maxPrice) && searchParams.has("maxPrice")) {
        if (p == null || p > maxPrice) return false;
      }
      return true;
    });

    // sort
    items.sort((a, b) => {
      let av: string | number = 0;
      let bv: string | number = 0;
      if (sort === "id") { av = a.id; bv = b.id; }
      if (sort === "name") { av = a.name?.toLowerCase() ?? ""; bv = b.name?.toLowerCase() ?? ""; }
      if (sort === "price") { av = a.price_usd ?? Number.POSITIVE_INFINITY; bv = b.price_usd ?? Number.POSITIVE_INFINITY; }
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });

    return Response.json({ items });
  } catch (err: any) {
    console.error("GET /api/offers error", err);
    return new Response(JSON.stringify({ error: "Failed to load offers" }), { status: 500 });
  }
}
