import { getBaseUrl } from "../lib/base-url";

export const dynamic = "force-dynamic";

export default async function Home() {
  const base = await getBaseUrl();
  const res  = await fetch(`${base}/api/offers`, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">QC Media</h1>
        <p className="text-red-600 mt-4">Failed to load offers: {res.status} {res.statusText}</p>
        <pre className="mt-2 bg-gray-100 p-3 rounded">{txt}</pre>
      </main>
    );
  }
  const data = await res.json();
  const items = Array.isArray(data) ? data : (Array.isArray((data as any)?.offers) ? (data as any).offers : []);
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">QC Media — Offers</h1>
      <ul className="mt-4 space-y-2">
        {items.map((o: any) => (
          <li key={o.id} className="border rounded p-3">
            <div className="font-semibold">{o.title ?? "(no title)"}</div>
            <div className="text-sm opacity-80">{o.description ?? ""}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}