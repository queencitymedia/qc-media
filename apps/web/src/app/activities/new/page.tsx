import { getBaseUrl } from "../lib/base-url";
const base = await getBaseUrl();
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewActivityPage() {
  const r = useRouter();
  const [form, setForm] = useState({
    lead_id: "",
    type: "call",
    summary: "",
    details: "",
    follow_up_at: ""
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      lead_id: Number(form.lead_id),
      type: form.type,
      summary: form.summary,
      details: form.details || undefined,
      follow_up_at: form.follow_up_at || undefined
    };
    const res = await fetch(`${base}/api/activities", { method: "POST", body: JSON.stringify(body) });
    if (res.ok) r.push("/activities");
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">New Activity</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border px-3 py-2 rounded w-full" placeholder="Lead ID (e.g., 1)" value={form.lead_id}
               onChange={e=>setForm({ ...form, lead_id: e.target.value })} />
        <select className="border px-3 py-2 rounded w-full" value={form.type}
                onChange={e=>setForm({ ...form, type: e.target.value })}>
          {["call","email","note","meeting"].map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
        <input className="border px-3 py-2 rounded w-full" placeholder="Summary" value={form.summary}
               onChange={e=>setForm({ ...form, summary: e.target.value })} />
        <textarea className="border px-3 py-2 rounded w-full" rows={4} placeholder="Details (optional)"
                  value={form.details} onChange={e=>setForm({ ...form, details: e.target.value })} />
        <input className="border px-3 py-2 rounded w-full" type="datetime-local" value={form.follow_up_at}
               onChange={e=>setForm({ ...form, follow_up_at: e.target.value })} />
        <button className="border px-4 py-2 rounded" type="submit">Create</button>
      </form>
    </div>
  );
}
