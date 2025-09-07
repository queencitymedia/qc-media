"use client";
import { useState } from "react";

type Offer = { id?: number; name: string; price_usd?: number; summary?: string; features?: string[] };

export default function OfferForm({
  initial, onSaved, mode="create"
}:{ initial?: Offer; onSaved:(o:Offer)=>void; mode?: "create"|"edit" }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price_usd?.toString() ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [featuresText, setFeaturesText] = useState((initial?.features ?? []).join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true); setError(null);
    const body: any = {
      name: name.trim(),
      summary: summary.trim() || undefined,
      features: featuresText.split(",").map(s => s.trim()).filter(Boolean),
    };
    const p = Number(price);
    if (!Number.isNaN(p) && price !== "") body.price_usd = p;

    const url = mode === "create"
      ? "/api/offers"
      : `/api/offers/${initial!.id}`;

    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      // Expect { error: "validation_failed", issues:[{path,message}] }
      if (json?.issues?.length) {
        setError(json.issues.map((i:any)=>`• ${i.path}: ${i.message}`).join("\n"));
      } else {
        setError(json?.error || "Request failed");
      }
      return;
    }
    onSaved(json);
    if (mode === "create") {
      setName(""); setPrice(""); setSummary(""); setFeaturesText("");
    }
  }

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <h3 className="font-semibold">{mode === "create" ? "Add Offer" : "Edit Offer"}</h3>
      {error && <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="text-sm space-y-1">
          <span className="text-gray-600">Name*</span>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Starter / Growth / Pro" />
        </label>
        <label className="text-sm space-y-1">
          <span className="text-gray-600">Price (USD)</span>
          <input value={price} onChange={e=>setPrice(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="750" inputMode="decimal" />
        </label>
        <label className="text-sm space-y-1 md:col-span-2">
          <span className="text-gray-600">Summary</span>
          <textarea value={summary} onChange={e=>setSummary(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} placeholder="Short one-liner…"/>
        </label>
        <label className="text-sm space-y-1 md:col-span-2">
          <span className="text-gray-600">Features (comma-separated)</span>
          <input value={featuresText} onChange={e=>setFeaturesText(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="4 posts/week, monthly blog, analytics" />
        </label>
      </div>
      <div className="flex gap-2 justify-end">
        <button disabled={busy} onClick={submit} className="px-3 py-2 rounded-lg bg-black text-white disabled:opacity-60">{busy ? "Saving…" : (mode==="create"?"Create":"Save changes")}</button>
      </div>
    </div>
  );
}