import { getBaseUrl } from "../lib/base-url";
const base = await getBaseUrl();
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewLeadPage() {
  const r = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", notes: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${base}/api/leads", { method: "POST", body: JSON.stringify(form) });
    if (res.ok) r.push("/leads");
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">New Lead</h1>
      <form onSubmit={submit} className="space-y-3">
        {["name","email","phone","company"].map(k=>(
          <input key={k} className="border px-3 py-2 rounded w-full" placeholder={k}
                 value={(form as any)[k]} onChange={e=>setForm({ ...form, [k]: e.target.value })} />
        ))}
        <textarea className="border px-3 py-2 rounded w-full" rows={4} placeholder="notes"
                  value={form.notes} onChange={e=>setForm({ ...form, notes: e.target.value })} />
        <button className="border px-4 py-2 rounded" type="submit">Create</button>
      </form>
    </div>
  );
}
