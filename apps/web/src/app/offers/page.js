import { headers } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function formatPrice(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

async function getOffers() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/offers`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch offers");
  }
  return res.json();
}

export default async function OffersPage() {
  const offers = await getOffers();

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">Service Packages</h1>
        <p className="opacity-80">Pick a plan that matches your growth goals.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((o) => (
          <Card key={o.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-6 flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-1">{o.name}</h2>
              <p className="text-sm opacity-80 mb-4">{o.summary}</p>
              <div className="text-3xl font-bold mb-4">${formatPrice(o.price_usd)}</div>
              <ul className="text-sm list-disc ml-4 space-y-1 flex-1">
                {o.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <div className="mt-6">
                <Button className="w-full">Get Started</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}