import { getBaseUrl } from "../lib/base-url";
const base = await getBaseUrl();
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AddOfferForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const payload: any = { name: name.trim() };
      if (price.trim() !== "") payload.price_usd = Number(price);
      const res = await fetch(`${base}/api/offers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }
      setName(""); setPrice("");
      router.refresh(); // revalidate server component list
    } catch (e:any) {
      setErr(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 8, maxWidth: 380 }}>
      <input
        placeholder="Offer name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        aria-label="Offer name"
        style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
      />
      <input
        placeholder="Monthly price (USD)"
        value={price}
        onChange={e => setPrice(e.target.value)}
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Price USD"
        style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
      />
      <button disabled={busy} style={{ padding: 10, borderRadius: 10, border: "1px solid #999" }}>
        {busy ? "Addingâ€¦" : "Add Offer"}
      </button>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
    </form>
  );
}
